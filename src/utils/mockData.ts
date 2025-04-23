
// Generate mock data for the Smart Socket IoT dashboard

export interface EnergyData {
  voltage: number;
  current: number;
  power: number;
  energy: number;
  timestamp: number;
}

export interface PowerHistory {
  time: string;
  power: number;
}

// Mock historical data - last 24 hours with 1-hour interval
export const generateMockHistoryData = (): PowerHistory[] => {
  const data: PowerHistory[] = [];
  const now = new Date();
  
  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now);
    timestamp.setHours(now.getHours() - i);
    
    // Base power between 100-600W with variation
    let basePower: number;
    
    // Create a pattern: lower at night, peaks in morning and evening
    const hour = timestamp.getHours();
    
    if (hour >= 0 && hour < 6) {
      // Night (low usage)
      basePower = 100 + Math.random() * 150;
    } else if (hour >= 6 && hour < 9) {
      // Morning peak
      basePower = 400 + Math.random() * 400;
    } else if (hour >= 9 && hour < 17) {
      // Daytime (medium)
      basePower = 250 + Math.random() * 250;
    } else if (hour >= 17 && hour < 22) {
      // Evening peak
      basePower = 450 + Math.random() * 350;
    } else {
      // Late night (lower)
      basePower = 150 + Math.random() * 200;
    }
    
    data.push({
      time: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      power: Math.round(basePower)
    });
  }
  
  return data;
};

// Generate real-time energy data
export const generateRealTimeData = (): EnergyData => {
  // Current time
  const timestamp = Date.now();
  
  // Determine if it's high-usage time (morning 6-9, evening 17-22)
  const hour = new Date().getHours();
  const isHighUsage = (hour >= 6 && hour < 9) || (hour >= 17 && hour < 22);
  
  // Generate mock values
  const voltage = 220 + (Math.random() * 20 - 10); // 210-230V
  const current = isHighUsage 
    ? 1.2 + Math.random() * 3.8 // 1.2-5A in high usage 
    : 0.1 + Math.random() * 1.5; // 0.1-1.6A in low usage
  const power = voltage * current; // P = V * I
  
  // Energy in kWh - This would normally be cumulative
  // Here we're just returning a value that would make sense for the simulation
  const hourOfDay = hour / 24;
  const baseEnergy = 5 + hourOfDay * 25; // Increases throughout the day
  const energy = baseEnergy + Math.random() * 2;
  
  return {
    voltage,
    current,
    power,
    energy,
    timestamp
  };
};

// Find the most power-hungry time in historical data
export const findPeakUsage = (data: PowerHistory[]) => {
  if (!data.length) return null;
  
  return data.reduce((max, point) => 
    point.power > max.power ? point : max, data[0]
  );
};

// Generate a fake PDF download URL (in a real app, this would call an API)
export const generateBillPDF = (month: string, usage: number, cost: number): string => {
  // This is a mock function that would normally trigger a backend to generate a PDF
  // For demo purposes, we just return a placeholder string
  return `data:application/pdf;base64,JVBERi0xLjMKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1IDAg
UiAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJlYW0KeAFLy0jMyVFIK8rPVShRSC7NV0hR
UDEEBACV4AUDCmVuZHN0cmVhbQplbmRvYmoKNSAwIG9iagozNAplbmRvYmoKMiAwIG9iago8
PCAvVHlwZSAvUGFnZSAvUGFyZW50IDMgMCBSIC9SZXNvdXJjZXMgNiAwIFIgL0NvbnRlbnRz
IDQgMCBSIC9NZWRpYUJveCBbMCAwIDMwMCAzMDBdCj4+CmVuZG9iago2IDAgb2JqCjw8IC9Q
cm9jU2V0IFsgL1BERiAvVGV4dCBdIC9Db2xvclNwYWNlIDw8IC9DczEgNyAwIFIgPj4gL0Zv
bnQgPDwgL1RUMiA5IDAgUgo+PiA+PgplbmRvYmoKMTAgMCBvYmoKPDwgL04gMyAvQWx0ZXJu
YXRlIC9EZXZpY2VTR0IgL0xlbmd0aCAxMSAwIFIgL0ZpbHRlciAvRmxhdGVEZWNvZGUgPj4K
c3RyZWFtCngBnZZ3VFPZFofPvTe90BIiICX0GnoJINI7SBUEUYlJgFAChoQmdkQFRhQRKVZk
VMABp4ciXLv/oAIHBwdHFzhMiMXJyMHDw2T///z8/v7+AHB8Cezo0FGDnVF0XJ089AeIAP4B
Q/zIAXkFsDRu8fflAGAnrO+dAIBEAOBv+5CbmzcAEACCoid5vhFgjO3XUAAUhgDgzpufTJkz
ACCDaRIGIGTplXcC4OwMZhLm1M4/UBQXY/YdmYAQZP8KBgDxK+vT339Pb/z9/Zv7d+lt7/MA
kIcMd/f0w7suIeDBEIskSVIIxWKxzCi9XBWoQrUqrU6rNxqMJrPFarNbHA6ny+3xWQQIgkJS
ckonUKlp6ZkKlaZQq8/S6w1Gi9Vmdz19/QODYfbI6Nj4xOSUfWZ2bn5hcWl5BZBKpTPWNja3
tnd29/YPDo+OT07PkmZkFlZMCQJQWFpZc/haweEdQDbYbDbbHQ6nd2R0bHxicmp6ZnZuHgDi
JQCAgKKm09PTMzMzS8vLy8vLy8vLS8vLywsLC1tbW9vb29vb29uJwOPxhMFQKBQKi0QikUgs
EolF2+32zs7Ozs7OFk9RUR3d35gAUddmAARnGDh+MAPLEBQEBAUA7gSAIHcUCIKgKIoiQixg
QzRJMtmzvZ4X1aYpmWyOpLHqolJ0pm1ZJsWaCnKmDjPI1inq6k12fOGJz6eKqzPfiObSvatS
LCvdVro23V3dle8d7ZVn65RqbYlam9bzI5tHrpMrso3La3R5HnVBiYuLi4uLi1dFMcroOEXH
dV0XdY7juI7juK7rOTk5OTc3Nzc3Nze3xnPOKdVotVqtVqvV6XQ6rVZrMBgMBoPBYIzFLi4u
Li4uLi4uTdNlWZZlWZI0TdM5zmKxOJ3OQCDgdrtcLpfT6XQ6nc1m02azeXl5eXl5enp6apo2
Go1Go9FoNBrNZrPRaDQajcZms9lisRiGYRhGJBKJRCKRSCQiSZIsy1qt1ul0mqbpdDo5juM4
rtls8jwvCIIoilarFUVRFEVJkiRJEkVR13Vd13meFwRBEASO4ziO4/l4DAaDwWAwGAwGgiAI
giAIgiAoFApFIpFIJBKJx+Pxer1er9fr9XqapmmapmlZVhRFURRN07QsK4qiKIqiKBqGYRiG
bdvhcDgcDsdisbhcLpfL5XK7g8EgQRAEQRAEQVAURY7jOI7jOK7ruu/7vu/7nufFYrF4PB6P
x+PxWCwWi8VisVgsFrPZbDabzeZwOBwOh8PhcIRCoVAoFAqFQoIgCIIgCIIgKIqi67qu67qu
6zzP8zzP8zxvGIZhGIZhGJZlWZZlWZZlWbZt27Zt27YdDAaDwWAwGAwKgmDbth3HcRzHcRzX
dV3XdV3XdV3P85RSSimllFJKKaOUUkoppZRS2pjdbvdQ6ueep//TRvyfkOe/b0rSTVSzAAAK
ZW5kc3RyZWFtCmVuZG9iagoxMSAwIG9iago5NzAKZW5kb2JqCjcgMCBvYmoKWyAvSUNDQmFz
ZWQgMTAgMCBSIF0KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9NZWRpYUJveCBb
MCAwIDMwMCAzMDBdIC9Db3VudCAxIC9LaWRzIFsgMiAwIFIgXSA+PgplbmRvYmoKMTIgMCBv
YmoKPDwgL1R5cGUgL0NhdGFsb2cgL1BhZ2VzIDMgMCBSID4+CmVuZG9iagoxMyAwIG9iago8
PCAvTGVuZ3RoIDE0IDAgUiAvTGVuZ3RoMSAxNSAwIFIgL0xlbmd0aDIgMTYgMCBSIC9MZW5n
dGgzIDE3IDAgUiAvQVNDSUk4NUVuY29kaW5nIDQgMCBSID4+CnN0cmVhbQp4ARiaGZhZGD0Y
m7OcZBNWuRLyXuDopGGUYJRilG6UaZQFkmGMMoAQzAIGRgYpMIuRgZGBiYHRPdKT4YiRO2Mo
wyoGDgZjhlAGbgY2BpYZEUAfMEDMYmBg/A+mkQDpf3R0lFSW7ZuH/MpP7Zf4l+2tlskSeDn6
LoPbMQUW3QfVfvo48Xs1U3fc+HiWvVvbm3r2dhjnTnZbBnmVu7exZJq111ftH9+/eu7AG++Y
+pKpzKnHYgQYm7xnAeNuLtDcJmOgOcXA+IMDqY1RBogo5/8HXwAA//8DAG2BH9wKZW5kc3Ry
ZWFtCmVuZG9iagoxNCAwIG9iagoxODgKZW5kb2JqCjE1IDAgb2JqCjE4NgplbmRvYmoKMTYg
MCBvYmoKMQplbmRvYmoKMTcgMCBvYmoKMQplbmRvYmoKMTggMCBvYmoKPDwgL1R5cGUgL0Zv
bnREZXNjcmlwdG9yIC9Bc2NlbnQgNzUwIC9DYXBIZWlnaHQgNjg2IC9EZXNjZW50IC0yNTAg
L0ZsYWdzIDMyCi9Gb250QkJveCBbLTMgLTMwMyA3NDYgNzUwXSAvRm9udE5hbWUgL1RpbWVz
TmV3Um9tYW5QUyAvSXRhbGljQW5nbGUgMAovU3RlbVYgOTcgPj4KZW5kb2JqCjkgMCBvYmoK
PDwgL1R5cGUgL0ZvbnQgL1N1YnR5cGUgL1RydWVUeXBlIC9GaXJzdENoYXIgMzIgL0xhc3RD
aGFyIDg0IC9XaWR0aHMgWyAyNTAKMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAw
IDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDY2NiAwIDAgMCA3MjEKMCA2MTAgMCAw
IDAgMCAwIDAgMCA3NzcgNzIxIF0gL0VuY29kaW5nIC9NYWNSb21hbkVuY29kaW5nIC9Gb250
RGVzY3JpcHRvcgoxOCAwIFIgL05hbWUgL1RUMiA+PgplbmRvYmoKMSAwIG9iago8PCAvVGl0
bGUgKFVudGl0bGVkKSAvQXV0aG9yICh1bmtub3duKSAvQ3JlYXRvciAoVW5rbm93bikgL1By
b2R1Y2VyIChNQUMgT1MgWCAxMC4xNS43IFF1YXJ0eiBQREZDb250ZXh0KQovQ3JlYXRpb25E
YXRlIChEOjIwMjMwODI1MDc0OTIwWjAwJzAwJykgL01vZERhdGUgKEQ6MjAyMzA4MjUwNzQ5
MjBaMDAnMDAnKQo+PgplbmRvYmoKeHJlZgowIDE5CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAw
MDAwMjMwOSAwMDAwMCBuIAowMDAwMDAwMTQ5IDAwMDAwIG4gCjAwMDAwMDEzODAgMDAwMDAg
biAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMTI5IDAwMDAwIG4gCjAwMDAwMDAyNDcg
MDAwMDAgbiAKMDAwMDAwMTM1MSAwMDAwMCBuIAowMDAwMDAwMDAwIDAwMDAwIG4gCjAwMDAw
MDIwNTMgMDAwMDAgbiAKMDAwMDAwMDM0MyAwMDAwMCBuIAowMDAwMDAxMzMxIDAwMDAwIG4g
CjAwMDAwMDE0NjEgMDAwMDAgbiAKMDAwMDAwMTUxMSAwMDAwMCBuIAowMDAwMDAxNzg5IDAw
MDAwIG4gCjAwMDAwMDE4MDkgMDAwMDAgbiAKMDAwMDAwMTgyOSAwMDAwMCBuIAowMDAwMDAx
ODQ4IDAwMDAwIG4gCjAwMDAwMDE4NjcgMDAwMDAgbiAKdHJhaWxlcgo8PCAvU2l6ZSAxOSAv
Um9vdCAxMiAwIFIgL0luZm8gMSAwIFIgL0lEIFsgPDY4ZjMzYjhmNzk4YmIxZjRlM2Y0MjU0
YzMzMzljY2ZkPgo8NjhmMzNiOGY3OThiYjFmNGUzZjQyNTRjMzMzOWNjZmQ+IF0gPj4Kc3Rh
cnR4cmVmCjI1MDYKJSVFT0YK==`;
};

// Sample billing period calculation
export const getBillingPeriod = (): string => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
};
