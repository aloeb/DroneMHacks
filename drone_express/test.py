import os
import requests
import json
import sys

#while True:
signal_strengths = {}
quality = None
wifi_info = os.popen("iwlist wlan0 scan")
for line in wifi_info:
    if line.strip().startswith("ESSID"):
        sid = line[line.index("\"") + 1: len(line) - 2]
        if not "\\" in sid: signal_strengths[sid] = quality;
    elif line.strip().startswith("Quality"):
        quality = float(line[line.index("=") + 1: line.index("/")]) / float(line[line.index("/") + 1:line.index("Signal") - 2])
print json.dumps(signal_strengths)
data = json.dumps({"index": sys.argv[1], "data": signal_strengths})
headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
print data
r = requests.post("http://localhost:8080/logData", data=data, headers=headers)
