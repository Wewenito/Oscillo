#Backend-related imports
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.http import HttpResponse, JsonResponse
from django.views.generic import TemplateView
from django.core.files.storage import FileSystemStorage
from django.conf import settings
from tempfile import NamedTemporaryFile

#Python general imports
import random
import json
import socket
import pickle
import sys
import base64
import os
import struct, time
from shutil import rmtree

#User-related imports
from django.contrib.auth.models import User
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import login, logout, authenticate
from .forms import CustomUserCreationForm, CustomAuthenticationForm, OscilloSettingsForm, UserUpdateForm, PasswordUpdateForm
from .models import FavoriteColors

def clear_temp_files(directory):
    """
    this function is here to clear out completely a directory given as a parameter.
    """
    if os.path.exists(directory):
        for filename in os.listdir(directory):
            file_path = os.path.join(directory, filename)
            try:
                if os.path.isfile(file_path) or os.path.islink(file_path):
                    os.unlink(file_path)
                elif os.path.isdir(file_path):
                    rmtree(file_path)
            except Exception as e:
                print(f'Failed to delete {file_path}. Reason: {e}')

def clear_console():
    if os.name == 'nt':
        os.system('cls')  #Windows (we never know..)
    else:
        os.system('clear') #Unix/Linux/MacOS

class Main(TemplateView):
    #This 'context' variable is what tells us what to expect before rendering the actual oscilloscope screen.
    #During testing these values need to be changed by hand here but later on will sent via the server depending on what the user selected
    context = {"mode": "NA", "channels": 3, "freq": 1e8, "nb": 1024, "voltage": 2.2, "bits": 16, "file_path": "NA", "file_position": 0, "theme": "dark", "gridOpacity": 0.5}

    sock: socket = None

    def index(self, request):
        data = {}
        for i in range(1, 11):#set to 1, 11 to generate 10 random channels
            channel = f"CH{i}"
            voltage = random.uniform(0, 8)
            data[channel] = {"voltage": voltage}
        
        colorSetsLight, colorSetsDark = get_user_favorite_colors(request)

        #assign colors to each channel
        c = 0
        for channel in data:
            data[channel]['colorLight'] = colorSetsLight[c]
            data[channel]['colorDark'] = colorSetsDark[c]

            c += 1

        if self.context['mode'] == 'FILE':
            file_size = request.session.get('file_size', 0)
            print(f"Getting ready to render the page with a file that has a size of {file_size:.2f} MB")

        return render(request, 'oscillo/graph.html', {"channels":data})
    

    def oscilloSelect(self, request):
        if request.method == 'POST':
            form = OscilloSettingsForm(request.POST, request.FILES)
            if form.is_valid():
                if form.cleaned_data['mode'] == 'FILE':
                    self.context['channels'] = 4
                    self.context['freq'] = 1e8
                    self.context['nb'] = 1024
                    self.context['voltage'] = 2.2 #normal values are -1.1V+1.1V so 2.2V total range.
                    self.context['bits'] = 16
                    self.context['mode'] = 'FILE'

                    #Handle the file upload.
                    print("Getting file size")
                    file = form.cleaned_data['file']
                    if file is None:
                        form = OscilloSettingsForm()
                        return render(request, 'oscillo/select.html', {'form': form, "error_message": "Please select a file to upload."})
                    file_size_in_bytes = file.size
                    file_size_in_mb = file_size_in_bytes / (1024 * 1024)
                    print(f"Uploaded file size: {file_size_in_mb:.2f} MB")
                    print(f"File name : {file.name}")
                    if file.name.split(".")[-1] != "osc":
                        form = OscilloSettingsForm()
                        return render(request, 'oscillo/select.html', {'form': form, "error_message": "The file given was not a .osc file."})

                    temp_files_directory = os.path.join(settings.BASE_DIR, 'temp_files')
                    clear_temp_files(temp_files_directory)

                    temp_file = NamedTemporaryFile(delete=False, suffix=".osc", dir=temp_files_directory)
                    for chunk in file.chunks():
                        temp_file.write(chunk)
                    temp_file.close()

                    print(f"File saved to temporary location: {temp_file.name}")

                    request.session['file_path'] = temp_file.name
                    request.session['file_size'] = file_size_in_mb
                    self.context['file_path'] = temp_file.name
                    print("FIle infos saved to session")

                else:
                    self.context['channels'] = form.cleaned_data['channels']
                    self.context['freq'] = form.cleaned_data['freq']
                    self.context['nb'] = form.cleaned_data['nb']
                    self.context['voltage'] = form.cleaned_data['voltage']
                    self.context['bits'] = form.cleaned_data['bits']
                    self.context['mode'] = form.cleaned_data['mode']
                return redirect('/oscillo/start/')
        else:
            form = OscilloSettingsForm()
            return render(request, 'oscillo/select.html', {'form': form})


    def settings(self, request):
        try:
            user = User.objects.get(pk=request.user.id)
            favorite_colors, created = FavoriteColors.objects.get_or_create(user=user)
            theme = favorite_colors.Theme_saved
            gridOpacity = favorite_colors.Grid_opacity
            self.context['theme'] = theme
            self.context['gridOpacity'] = gridOpacity
        except:
            print("No user logged.")
        
        return HttpResponse(json.dumps(self.context))


    def getData(self, request):
        if not self.sock:
            self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            self.sock.bind(("127.0.0.1", 7888))
            self.sock.settimeout(1)
            print("bound")

        try:
            #Here we update the amount of bytes we expect to receive based off of the settings we received.
            #Nb of channels * 1024 samples per frame * 2 bytes per sample
            expected_data_to_send = self.context['channels'] * 1024 * 2

            data, _ = self.sock.recvfrom(expected_data_to_send)
            print(f"Data received is {len(data)} bytes long")
            return HttpResponse(data, content_type="application/octet-stream")
        except socket.timeout:
            return HttpResponse("No data received so far..", status=408)

 
    def getRawData(self, request):
        if not self.sock:
            self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            self.sock.bind(("127.0.0.1", 7777))
            self.sock.settimeout(1)
            print("bound")

        data, adr = self.sock.recvfrom(8192)
        print("received", len(data))
        return HttpResponse(data)


    def getFileData(self, request, filePosition, fileName):
        #clear_console()
        print(f"GET DATA AT POSITION {filePosition} FOR FILE {fileName}")

        completeFilePath = os.path.join(settings.BASE_DIR, 'temp_files') + "/" + fileName
        Data = read_file(completeFilePath, filePosition)
        if Data == "EOF":#End Of File
            Data = read_file(completeFilePath, 0)

        print("====================================================")
        print("           Data returned from the file")
        print("             --------------------")
        print("Number of samples: ", Data[0][0])
        print("New position in the file: ", Data[1])
        print("Length of CH1 : ", len(Data[0][2]))
        print("Length of CH2 : ", len(Data[0][3]))
        print("Length of CH3 : ", len(Data[0][4]))
        print("Length of CH4 : ", len(Data[0][5]))
        print("Header Data : ", Data[0][1])
        print("====================================================")
        return JsonResponse(Data, safe=False)
    

def SetNewColors(request, UID):
    if request.method == 'POST':
        try:
            if UID == 0:#User not registered
                return JsonResponse({"status": "error", "message": "You need to be registered in order to save your color preferences."}, status=315)

            data = json.loads(request.body)
            ColorChoicesDark = data.get('ColorChoicesDark', [])
            ColorChoicesLight = data.get('ColorChoicesLight', [])
            gridOpacity = data.get('gridOpacity', [])

            print(f"User ID: {UID}")
            print(f"ColorChoicesDark: {ColorChoicesDark}")
            print(f"ColorChoicesLight: {ColorChoicesLight}")

            user = User.objects.get(pk=UID)

            favorite_colors, created = FavoriteColors.objects.get_or_create(user=user)

            favorite_colors.CH1_L = ColorChoicesLight[0]
            favorite_colors.CH2_L = ColorChoicesLight[1]
            favorite_colors.CH3_L = ColorChoicesLight[2]
            favorite_colors.CH4_L = ColorChoicesLight[3]
            favorite_colors.CH5_L = ColorChoicesLight[4]
            favorite_colors.CH6_L = ColorChoicesLight[5]
            favorite_colors.CH7_L = ColorChoicesLight[6]
            favorite_colors.CH8_L = ColorChoicesLight[7]
            favorite_colors.CH9_L = ColorChoicesLight[8]
            favorite_colors.CH10_L = ColorChoicesLight[9]

            favorite_colors.CH1_D = ColorChoicesDark[0]
            favorite_colors.CH2_D = ColorChoicesDark[1]
            favorite_colors.CH3_D = ColorChoicesDark[2]
            favorite_colors.CH4_D = ColorChoicesDark[3]
            favorite_colors.CH5_D = ColorChoicesDark[4]
            favorite_colors.CH6_D = ColorChoicesDark[5]
            favorite_colors.CH7_D = ColorChoicesDark[6]
            favorite_colors.CH8_D = ColorChoicesDark[7]
            favorite_colors.CH9_D = ColorChoicesDark[8]
            favorite_colors.CH10_D = ColorChoicesDark[9]

            favorite_colors.Grid_opacity = float(gridOpacity)

            favorite_colors.save()

            return JsonResponse({"status": "success", "message": "Color choices saved."})
        except json.JSONDecodeError:
            return JsonResponse({"status": "error", "message": "Invalid JSON data."}, status=400)
    else:
        return JsonResponse({"status": "error", "message": "Invalid request method."}, status=405)


def setThemePreference(request, UID):
    if request.method == 'POST':
        try:
            if UID == 0:#User not registered
                return JsonResponse({"status": "error", "message": "Please register to save your theme preference between sessions."}, status=320)
            
            data = json.loads(request.body)
            theme = data.get('theme', [])

            user = User.objects.get(pk=UID)
            favorite_colors, created = FavoriteColors.objects.get_or_create(user=user)

            favorite_colors.Theme_saved = theme
            favorite_colors.save()
            return JsonResponse({"status": "success", "message": "Theme preference saved."})
        except json.JSONDecodeError:
            return JsonResponse({"status": "error", "message": "Invalid JSON data."}, status=400)
    else:
        return JsonResponse({"status": "error", "message": "Invalid request method."}, status=405)


def get_user_favorite_colors(request):
    # Default color sets
    colorSetsLight = ["green", "red", "gray", "olive", "cyan", "orange", "maroon", "blue", "purple", "black"]
    colorSetsDark = ["lime", "red", "cyan", "yellow", "green", "orange", "pink", "blue", "fuchsia", "white"]

    # Check if the user is authenticated
    if request.user.is_authenticated:
        # Try to get the FavoriteColors instance for the user
        try:
            favorite_colors = FavoriteColors.objects.get(user=request.user)
        except FavoriteColors.DoesNotExist:
            # If it does not exist, create it
            favorite_colors = FavoriteColors.objects.create(user=request.user)
        
        # Now, we have a FavoriteColors instance (either fetched or newly created)
        # Update the color sets to use the user's favorite colors
        colorSetsLight = [
            favorite_colors.CH1_L, favorite_colors.CH2_L, favorite_colors.CH3_L,
            favorite_colors.CH4_L, favorite_colors.CH5_L, favorite_colors.CH6_L,
            favorite_colors.CH7_L, favorite_colors.CH8_L, favorite_colors.CH9_L,
            favorite_colors.CH10_L
        ]
        colorSetsDark = [
            favorite_colors.CH1_D, favorite_colors.CH2_D, favorite_colors.CH3_D,
            favorite_colors.CH4_D, favorite_colors.CH5_D, favorite_colors.CH6_D,
            favorite_colors.CH7_D, favorite_colors.CH8_D, favorite_colors.CH9_D,
            favorite_colors.CH10_D
        ]

    return colorSetsLight, colorSetsDark


def register_view(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            messages.success(request, "Registration successful.")
            return redirect('/oscillo/')  # Redirect to the home page
        else:
            print("FORM ERRORS : ")
            print(form.errors)
            messages.error(request, "Unsuccessful registration. Invalid information.")
    else:
        form = CustomUserCreationForm()
    return render(request, 'users/register.html', {'form': form})


def login_view(request):
    if request.method == 'POST':
        form = CustomAuthenticationForm(request, data=request.POST)#Here we use a custom form to allow the user to enter either their username or their email
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect('/oscillo/') # Redirect to the home page
            else:
                messages.error(request, "Invalid username/mail or password.")
        else:
            messages.error(request, "Invalid username/mail or password.")
    else:
        form = CustomAuthenticationForm()
    
    return render(request, 'users/login.html', {'form': form})

    
def disconnect(request):
    logout(request)
    return redirect("/oscillo/")


def profile(request):
    try:
        UID = request.user.id
        user = User.objects.get(pk=UID)

        if request.method == "POST":
            form = UserUpdateForm(request.POST)
            if form.is_valid():
                user.username = form.cleaned_data['username']
                user.first_name = form.cleaned_data['first_name']
                user.last_name = form.cleaned_data['last_name']
                user.email = form.cleaned_data['email']
                user.save()
        else:
            form = UserUpdateForm(initial={
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email
            })

        return render(request, "users/profile.html", {"user": user, "form": form})
    except Exception as E:
        print(f"Error : {E}")
        return redirect('/oscillo/')


def changePasswd(request):
    try:

        if request.method == "POST":
            UID = request.user.id
            user = User.objects.get(pk=UID)
            errors = []

            form = PasswordUpdateForm(request.POST)
            if form.is_valid():
                if user.check_password(form.cleaned_data['currentPassword']):
                    if form.cleaned_data['newPassword1'] == form.cleaned_data['newPassword2']:
                        #Change the passwd of the user
                        user.set_password(form.cleaned_data['newPassword1'])
                        user.save()
                        return redirect("/oscillo/")
                    else:
                        errors.append("The two passwords given do not match.")
                else:
                    print("Wrong current password")
                    errors.append("The current password given is not right.")

            return render(request, "users/changePasswd.html", {"user": user, "form": form, "errors": errors})
        else:
            form = PasswordUpdateForm()
            return render(request, "users/changePasswd.html", {"form": form})            
    except Exception as E:
        print(f"Error : {E}")
        return redirect('/oscillo/')


def read_file(file_path, position_within_the_file):
    ChannelPoints1 = []
    ChannelPoints2 = []
    ChannelPoints3 = []
    ChannelPoints4 = []

    def read_header(filename, position):
        with open(filename, 'rb') as file:
            file.seek(position)
            header = file.read(22)  # Read the first 22 bytes of the file
            if len(header) < 22:
                raise EOFError("Unable to read full header; end of file reached.")
            return header

    def rearrange_bytes_and_convert(header):
        # Unpacking and rearranging the first 16 bytes for trigger counts
        triggers = []
        for i in range(0, 16, 4):
            # Extract 4 bytes, reorder them from 3-4-1-2 to standard big-endian
            reordered = header[i+2:i+4] + header[i:i+2]
            # Convert reordered bytes to a number
            trigger_count = struct.unpack('>I', reordered)[0]
            triggers.append(trigger_count)
        
        # Unpacking and rearranging the last 6 bytes for ADC clock ticks
        # Original order: 5-6-3-4-1-2, we need to reorder to 1-2-3-4-5-6
        reordered_ticks = header[20:22] + header[18:20] + header[16:18]
        # Convert reordered bytes to a number, pad to 8 bytes for unpacking as 64-bit int
        ticks = struct.unpack('>Q', b'\x00\x00' + reordered_ticks)[0]

        return triggers, ticks

    def read_data(filename, position):
        with open(filename, 'rb') as file:
            file.seek(22 + position) #skip the header (22bytes long), indexing starts at 0
            total_samples = 0
            currentChannel = None

            #Here we make sure the arrays are empty and not full from a previous loop
            ChannelPoints1.clear()
            ChannelPoints2.clear()
            ChannelPoints3.clear()
            ChannelPoints4.clear()

            while True:
                bytes_read = file.read(2)
                value = struct.unpack('>h', bytes_read)[0]

                if value == -1:
                    if currentChannel is None:
                        currentChannel = 1
                    elif currentChannel == 1:
                        currentChannel = None

                        #Here we handle the case in which there aren't 4 channels in this file
                        next_bytes = file.read(2)
                        next_value = struct.unpack('>h', next_bytes)[0]
                        file.seek(-2, 1)#Go back to the previous position
                        if next_value != -2 and next_value != -3 and next_value != -4:
                            print("NO MORE CHANNELS AFTER CH1")
                            latest_position = file.tell()
                            return latest_position, total_samples
                    continue
                elif value == -2:
                    if currentChannel == None:
                        currentChannel = 2
                    elif currentChannel == 2:
                        currentChannel = None

                        #Here we handle the case in which there aren't 4 channels in this file
                        next_bytes = file.read(2)
                        next_value = struct.unpack('>h', next_bytes)[0]
                        file.seek(-2, 1)#Go back to the previous position
                        if next_value != -3 and next_value != -4:
                            print("NO MORE CHANNELS AFTER CH2")
                            latest_position = file.tell()
                            return latest_position, total_samples
                    continue
                elif value == -3:
                    if currentChannel == None:
                        currentChannel = 3
                    elif currentChannel == 3:
                        currentChannel = None

                        #Here we handle the case in which there aren't 4 channels in this file
                        next_bytes = file.read(2)
                        next_value = struct.unpack('>h', next_bytes)[0]
                        file.seek(-2, 1)#Go back to the previous position
                        if next_value != -4:
                            print("NO MORE CHANNELS AFTER CH3")
                            latest_position = file.tell()
                            return latest_position, total_samples
                    continue
                elif value == -4:
                    if currentChannel == None:
                        currentChannel = 4
                    elif currentChannel == 4:
                        currentChannel = None
                        CurrentPosition = file.tell()
                        return CurrentPosition, total_samples
                elif value == 24575 or value == 24576:#positive / negative overflow
                    continue
                elif value >= 0 and value <= 16383:
                    if currentChannel == 1:
                        ChannelPoints1.append(value)
                    elif currentChannel == 2:
                        ChannelPoints2.append(value)
                    elif currentChannel == 3:
                        ChannelPoints3.append(value)
                    elif currentChannel == 4:
                        ChannelPoints4.append(value)
                    total_samples += 1
                elif value < -4:
                    total_samples += 1

    def MAIN(position_within_the_file):
        filename = file_path

        try:
            #Here we get the header of that section of the file
            header = read_header(filename, position_within_the_file)
            triggers, ticks = rearrange_bytes_and_convert(header)

            headerData = {
                "ADCClockTicks": ticks,
                "TriggerCountCH1": triggers[0],
                "TriggerCountCH2": triggers[1],
                "TriggerCountCH3": triggers[2],
                "TriggerCountCH4": triggers[3]
            }
            
            #Then we get the data of said section
            try:
                position_within_the_file, NbSamples = read_data(filename, position_within_the_file)
            except:
                raise EOFError("End of file reached.")

            DataPacked = [NbSamples, headerData, ChannelPoints1, ChannelPoints2, ChannelPoints3, ChannelPoints4]

            return DataPacked, position_within_the_file

        except EOFError as e:
            #End of file reached, we start over.
            print(str(e))
            return "EOF"

    return MAIN(position_within_the_file)