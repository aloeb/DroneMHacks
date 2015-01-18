import time
 
import Adafruit_Nokia_LCD as LCD
import Adafruit_GPIO.SPI as SPI
 
import Image
import ImageDraw
import ImageFont

import fileinput

#Beaglebone Black hardware SPI config:
DC = 'P9_15'
RST = 'P9_12'
SPI_PORT = 1
SPI_DEVICE = 0
 
# Beaglebone Black software SPI config:
# DC = 'P9_15'
# RST = 'P9_12'
# SCLK = 'P8_7'
# DIN = 'P8_9'
# CS = 'P8_11'
# Hardware SPI usage:
disp = LCD.PCD8544(DC, RST, spi=SPI.SpiDev(SPI_PORT, SPI_DEVICE, max_speed_hz=4000000))
 
# Software SPI usage (defaults to bit-bang SPI interface):
#disp = LCD.PCD8544(DC, RST, SCLK, DIN, CS)
 
# Initialize library.
disp.begin(contrast=60)
 
# Clear display.
disp.clear()
disp.display()

# Load default font.
font = ImageFont.load_default()
 
# Alternatively load a TTF font.
# Some nice fonts to try: http://www.dafont.com/bitmap.php
# font = ImageFont.truetype('Minecraftia.ttf', 8)
 
# Write some text.
line = 0;
for line in fileinput.input():
	draw.text((0,5 * line), line, font=font)
	line = line + 1;
 
# Display image.
disp.image(image)
disp.display()
