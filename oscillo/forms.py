from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.models import User


class CustomUserCreationForm(UserCreationForm):
    first_name = forms.CharField(required=True)
    last_name = forms.CharField(required=True)
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ("username", "first_name", "last_name", "email", "password1", "password2")

    def save(self, commit=True):
        user = super().save(commit=False)
        user.first_name = self.cleaned_data['first_name']
        user.last_name = self.cleaned_data['last_name']
        user.email = self.cleaned_data['email']
        if commit:
            user.save()
        return user
    

class CustomAuthenticationForm(AuthenticationForm):
    username = forms.CharField(label="Username or Email")

    def __init__(self, *args, **kwargs):
        super(CustomAuthenticationForm, self).__init__(*args, **kwargs)
        self.fields['username'].widget.attrs.update({'class': 'form-control'})
        self.fields['password'].widget.attrs.update({'class': 'form-control'})


class UserUpdateForm(forms.Form):
    username = forms.CharField(
        max_length=100, 
        label="Username",
        widget=forms.TextInput(attrs={'class': 'form-control', 'disabled': 'disabled'})
    )

    first_name = forms.CharField(
        max_length=100,
        label="First name",
        widget=forms.TextInput(attrs={'class': 'form-control', 'disabled': 'disabled'})
    )

    last_name = forms.CharField(
        max_length=100,
        label="Last name",
        widget=forms.TextInput(attrs={'class': 'form-control', 'disabled': 'disabled'})
    )

    email = forms.EmailField(
        max_length=100,
        label="Email",
        widget=forms.TextInput(attrs={'class': 'form-control', 'disabled': 'disabled'})
    )


class PasswordUpdateForm(forms.Form):
    currentPassword = forms.CharField(
        max_length=100,
        label="Current password",
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )

    newPassword1 = forms.CharField(
        max_length=100,
        label="New password",
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    
    newPassword2 = forms.CharField(
        max_length=100,
        label="Confirm new password",
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )


class OscilloSettingsForm(forms.Form):
    MODE_CHOICES = (
        ('REAL-TIME', 'Real-Time'),
        ('FILE', 'File'),
    )

    mode = forms.ChoiceField(
        choices=MODE_CHOICES,
        label='Mode :',
        initial='REAL-TIME',
        widget=forms.Select(attrs={'onchange': 'updateFormVisibility();', 'class': 'form-control'}),
    )

    channels = forms.IntegerField(
        label='Number of Channels : ',
        initial=4,
        min_value=1,
        max_value=10,
        widget=forms.NumberInput(attrs={'placeholder': '3', 'class': 'form-control'}),
        required=False
    )
    freq = forms.FloatField(
        label='Frequency (Hz) : ',
        initial=1e8,
        min_value=1.0,
        max_value=1e9,
        widget=forms.NumberInput(attrs={'placeholder': '1e8', 'class': 'form-control'}),
        required=False
    )
    nb = forms.IntegerField(
        label='Samples per frame : ',
        initial=1024,
        min_value=32,
        max_value=4096,
        widget=forms.NumberInput(attrs={'placeholder': 'Enter number of samples', 'class': 'form-control'}),
        required=False
    )
    voltage = forms.FloatField(
        label='Voltage (V) : ',
        initial=2.2,
        min_value=0.1,
        max_value=50,
        widget=forms.NumberInput(attrs={'placeholder': 'Enter voltage in volts', 'class': 'form-control'}),
        required=False
    )
    bits = forms.IntegerField(
        label='Bit Depth : ',
        initial=16,
        min_value=14,
        max_value=64,
        widget=forms.NumberInput(attrs={'placeholder': 'Enter bit depth', 'class': 'form-control'}),
        required=False
    )

    file = forms.FileField(
        label='Select a .osc file', 
        widget=forms.ClearableFileInput(attrs={'class': 'form-control'}), 
        required=False
    )
