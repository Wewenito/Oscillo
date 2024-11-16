#!/usr/bin/python3
# coding: utf-8
import socket
import optparse
import time
import math

parser = optparse.OptionParser(usage="%prog [options] \n\nSend data via UDP protocol")
parser.add_option("-s", "--size", action="store", dest="size", help="Taille des paquets de données en octets", default=8192)
parser.add_option("-n", "--nb", action="store", dest="nb", help="Nombre d'échantillons par frame", default=1024)
parser.add_option("-c", "--channels", action="store", dest="channels", help="Nombre de voies", default=1)
parser.add_option("-d", "--delay", action="store", dest="delay", help="Durée entre deux envois (en ms)", default=100)
parser.add_option("-f", "--file", action="store", dest="file", help="chemin du fichier où lire les données")
parser.add_option("-i", "--ip", action="store", dest="ip", help="adresse ipv4 où envoyer les données", default="127.0.0.1")
parser.add_option("-p", "--port", action="store", dest="port", help="Numéro de port", default=7999)
parser.add_option("-r", "--repeat", action="store", dest="repeat", help="Nombre d'envois de paquets", default=0)
parser.add_option("-g", "--group", action="store", dest="group", help="Nombre de paquets regroupés dans un envoi (supplémentaire, 1 par défaut)", default=1)

(options, args) = parser.parse_args()

options.delay = int(options.delay)
options.channels = int(options.channels)
options.port = int(options.port)

# Create a datagram socket
UDPServerSocket = socket.socket(family=socket.AF_INET, type=socket.SOCK_DGRAM)
# bytesAddressPair = UDPServerSocket.recvfrom(bufferSize)
iBnd = 0
nbFrame = options.size // (options.nb * 2 * options.channels)
nbSend = nbFrame * options.nb * 2 * options.channels  # nb bytes sent
print(nbSend, "=", options.channels, "*", nbFrame, "*", options.nb, "*", 2)
arrBytes = bytearray(nbSend)
iRepeat = int(options.repeat)

if options.file:
    filData = open(options.file, "rb")
else:  # Si pas de fichier, sinusoide de démo
    iHeight = 1 << 15
    for iFrm in range(nbFrame):
        for iCh in range(options.channels):
            for iSmp in range(options.nb):
                iVal = int((math.sin((iSmp + iCh * 10) * 4 * math.pi / options.nb) + 1) / 2 * iHeight)
                arrBytes[(iSmp + (iCh + iFrm * options.channels) * options.nb) * 2] = iVal & 0xFF
                arrBytes[(iSmp + (iCh + iFrm * options.channels) * options.nb) * 2 + 1] = iVal >> 8

while iRepeat == 0 or iBnd < iRepeat:
    iBnd += 1
    if options.file:
        arrBytes = bytearray(filData.read(nbSend))

    UDPServerSocket.sendto(arrBytes, (options.ip, options.port))
    time.sleep(options.delay / 1000)

filData.close()
