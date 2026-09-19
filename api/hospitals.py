import math
import re
from typing import List, Dict, Any, Optional

# Multi-State Verified Indian Cardiac Care Hospital Dataset
INDIAN_CARDIAC_HOSPITALS: List[Dict[str, Any]] = [
  # ── TAMIL NADU ─────────────────────────────────────────────────────────────
  {
    "id": "tn-che-01",
    "name": "Apollo Heart Center & Super Specialty Hospital",
    "type": "Tertiary Cardiac Care Center",
    "state": "Tamil Nadu",
    "district": "Chennai",
    "city": "Chennai",
    "pincode": "600006",
    "address": "Greams Road, Thousand Lights, Chennai, Tamil Nadu 600006",
    "lat": 13.0604,
    "lng": 80.2496,
    "phone": "+91 44 2829 0200",
    "emergencyPhone": "1066 / +91 44 2829 3333",
    "website": "https://www.apollohospitals.com/chennai/",
    "rating": 4.8,
    "reviewsCount": 1420,
    "specialties": ["Cardiology", "Cardiac Surgery", "Emergency Care", "Electrophysiology"],
    "departments": ["24/7 Cath Lab", "Cardiac ICU (CCU)", "Heart Transplant Unit", "Pediatric Cardiology"],
    "isEmergency247": True,
    "isOpenNow": True,
    "operatingHours": "24 Hours Emergency & IPD | OPD: 8:00 AM - 8:00 PM",
    "mapsUrl": "https://www.google.com/maps/search/?api=1&query=Apollo+Heart+Center+Greams+Road+Chennai"
  },
  {
    "id": "tn-che-02",
    "name": "Frontier Lifeline Hospital (Dr. K.M. Cherian Heart Foundation)",
    "type": "Specialized Cardiac Institute",
    "state": "Tamil Nadu",
    "district": "Chennai",
    "city": "Chennai",
    "pincode": "600058",
    "address": "Ambattur Industrial Estate, Chennai, Tamil Nadu 600058",
    "lat": 13.0975,
    "lng": 80.1611,
    "phone": "+91 44 4201 7575",
    "emergencyPhone": "+91 44 2656 5900",
    "website": "https://frontierlifeline.com/",
    "rating": 4.7,
    "reviewsCount": 890,
    "specialties": ["Cardiac Surgery", "Cardiology", "Emergency Care"],
    "departments": ["Bypass Surgery", "Adult & Pediatric Heart Care", "Cardiovascular Research"],
    "isEmergency247": True,
    "isOpenNow": True,
    "operatingHours": "24 Hours Emergency | OPD: 9:00 AM - 6:00 PM",
    "mapsUrl": "https://www.google.com/maps/search/?api=1&query=Frontier+Lifeline+Hospital+Chennai"
  },
  {
    "id": "tn-che-03",
    "name": "Fortis Malar Hospital Cardiac Division",
    "type": "Multi-Specialty Heart Center",
    "state": "Tamil Nadu",
    "district": "Chennai",
    "city": "Chennai",
    "pincode": "600020",
    "address": "Adyar, Gandhi Nagar, Chennai, Tamil Nadu 600020",
    "lat": 13.0067,
    "lng": 80.2572,
    "phone": "+91 44 4289 2222",
    "emergencyPhone": "+91 44 4289 2100",
    "website": "https://www.fortishealthcare.com/location/fortis-malar-hospital-chennai",
    "rating": 4.6,
    "reviewsCount": 760,
    "specialties": ["Cardiology", "Cardiac Surgery", "Emergency Care"],
    "departments": ["Interventional Cardiology", "Cardiac Rehabilitation", "Heart Failure Clinic"],
    "isEmergency247": True,
    "isOpenNow": True,
    "operatingHours": "24 Hours Emergency | OPD: 8:30 AM - 7:30 PM",
    "mapsUrl": "https://www.google.com/maps/search/?api=1&query=Fortis+Malar+Hospital+Adyar+Chennai"
  },
  {
    "id": "tn-che-04",
    "name": "MGM Healthcare Institute of Cardiac Sciences",
    "type": "Super Specialty Hospital",
    "state": "Tamil Nadu",
    "district": "Chennai",
    "city": "Chennai",
    "pincode": "600029",
    "address": "Nelson Manickam Road, Aminjikarai, Chennai, Tamil Nadu 600029",
    "lat": 13.0722,
    "lng": 80.2225,
    "phone": "+91 44 4524 2424",
    "emergencyPhone": "+91 44 4524 2400",
    "website": "https://mgmhealthcare.in/",
    "rating": 4.9,
    "reviewsCount": 1100,
    "specialties": ["Cardiology", "Cardiac Surgery", "Emergency Care"],
    "departments": ["Advanced Mechanical Circulatory Support", "Robotic Cardiac Surgery", "Cardio-Oncology"],
    "isEmergency247": True,
    "isOpenNow": True,
    "operatingHours": "24 Hours Emergency | OPD: 9:00 AM - 7:00 PM",
    "mapsUrl": "https://www.google.com/maps/search/?api=1&query=MGM+Healthcare+Aminjikarai+Chennai"
  },
  {
    "id": "tn-che-05",
    "name": "Sri Ramachandra Heart Care Centre",
    "type": "University Medical Center",
    "state": "Tamil Nadu",
    "district": "Chennai",
    "city": "Chennai",
    "pincode": "600116",
    "address": "Porur, Chennai, Tamil Nadu 600116",
    "lat": 13.0382,
    "lng": 80.1412,
    "phone": "+91 44 4592 8500",
    "emergencyPhone": "+91 44 2476 8403",
    "website": "https://www.sriramachandra.edu.in/",
    "rating": 4.5,
    "reviewsCount": 650,
    "specialties": ["Cardiology", "General Cardiac Consultation", "Emergency Care"],
    "departments": ["Non-Invasive Cardiology", "Echocardiography Lab", "Preventive Cardiology"],
    "isEmergency247": True,
    "isOpenNow": True,
    "operatingHours": "24 Hours Emergency | OPD: 8:00 AM - 5:00 PM",
    "mapsUrl": "https://www.google.com/maps/search/?api=1&query=Sri+Ramachandra+Hospital+Porur+Chennai"
  },
  {
    "id": "tn-cbe-01",
    "name": "Kovai Medical Center Heart Institute (KMCH)",
    "type": "Regional Super Specialty",
    "state": "Tamil Nadu",
    "district": "Coimbatore",
    "city": "Coimbatore",
    "pincode": "641014",
    "address": "Avinashi Road, Civil Aerodrome Post, Coimbatore, Tamil Nadu 641014",
    "lat": 11.0402,
    "lng": 77.0375,
    "phone": "+91 422 432 3800",
    "emergencyPhone": "105785 / +91 422 432 3000",
    "website": "https://www.kmchhospitals.com/",
    "rating": 4.8,
    "reviewsCount": 940,
    "specialties": ["Cardiology", "Cardiac Surgery", "Emergency Care"],
    "departments": ["Electrophysiology Lab", "Coronary Care Unit", "Pediatric Heart Surgery"],
    "isEmergency247": True,
    "isOpenNow": True,
    "operatingHours": "24 Hours Emergency & Trauma | OPD: 8:30 AM - 6:30 PM",
    "mapsUrl": "https://www.google.com/maps/search/?api=1&query=KMCH+Avinashi+Road+Coimbatore"
  },
  {
    "id": "tn-cbe-02",
    "name": "G. Kuppuswamy Naidu Memorial Hospital (GKNM Cardiac Sciences)",
    "type": "Super Specialty Hospital",
    "state": "Tamil Nadu",
    "district": "Coimbatore",
    "city": "Coimbatore",
    "pincode": "641037",
    "address": "P.N. Palayam, Coimbatore, Tamil Nadu 641037",
    "lat": 11.0135,
    "lng": 76.9745,
    "phone": "+91 422 224 5000",
    "emergencyPhone": "+91 422 430 5000",
    "website": "https://www.gknmhospital.org/",
    "rating": 4.7,
    "reviewsCount": 780,
    "specialties": ["Cardiology", "Cardiac Surgery", "Emergency Care"],
    "departments": ["Comprehensive Cath Lab", "Heart Valve Clinic", "Coronary Artery Bypass"],
    "isEmergency247": True,
    "isOpenNow": True,
    "operatingHours": "24 Hours Emergency | OPD: 8:00 AM - 7:00 PM",
    "mapsUrl": "https://www.google.com/maps/search/?api=1&query=GKNM+Hospital+Coimbatore"
  },
  {
    "id": "tn-mad-01",
    "name": "Apollo Speciality Hospitals Madurai",
    "type": "Multi-Specialty Heart Center",
    "state": "Tamil Nadu",
    "district": "Madurai",
    "city": "Madurai",
    "pincode": "625020",
    "address": "Lake View Road, K.K. Nagar, Madurai, Tamil Nadu 625020",
    "lat": 9.9328,
    "lng": 78.1472,
    "phone": "+91 452 258 0888",
    "emergencyPhone": "1066 / +91 452 258 0000",
    "website": "https://madurai.apollohospitals.com/",
    "rating": 4.7,
    "reviewsCount": 820,
    "specialties": ["Cardiology", "Cardiac Surgery", "Emergency Care"],
    "departments": ["Advanced Cardiac Cath Lab", "Emergency Resuscitation Unit", "ICU & CCU"],
    "isEmergency247": True,
    "isOpenNow": True,
    "operatingHours": "24 Hours Emergency | OPD: 8:30 AM - 7:00 PM",
    "mapsUrl": "https://www.google.com/maps/search/?api=1&query=Apollo+Speciality+Hospitals+KK+Nagar+Madurai"
  },
  {
    "id": "tn-mad-02",
    "name": "Velammal Medical College Hospital & Heart Center",
    "type": "Super Specialty Teaching Hospital",
    "state": "Tamil Nadu",
    "district": "Madurai",
    "city": "Madurai",
    "pincode": "625009",
    "address": "Tuticorin Ring Road, Anuppanadi, Madurai, Tamil Nadu 625009",
    "lat": 9.8972,
    "lng": 78.1415,
    "phone": "+91 452 711 0000",
    "emergencyPhone": "+91 452 711 0100",
    "website": "https://velammalmedicalcollege.edu.in/",
    "rating": 4.6,
    "reviewsCount": 610,
    "specialties": ["Cardiology", "General Cardiac Consultation", "Emergency Care"],
    "departments": ["Non-Invasive Diagnostic Cardiology", "Echocardiography", "Preventive Care"],
    "isEmergency247": True,
    "isOpenNow": True,
    "operatingHours": "24 Hours Emergency | OPD: 8:00 AM - 5:00 PM",
    "mapsUrl": "https://www.google.com/maps/search/?api=1&query=Velammal+Hospital+Madurai"
  },
  {
    "id": "tn-sal-01",
    "name": "Manipal Hospital Salem Cardiac Sciences",
    "type": "Tertiary Care Hospital",
    "state": "Tamil Nadu",
    "district": "Salem",
    "city": "Salem",
    "pincode": "636012",
    "address": "Dalmia Board, Bangalore Highway, Salem, Tamil Nadu 636012",
    "lat": 11.6845,
    "lng": 78.1189,
    "phone": "+91 427 234 6600",
    "emergencyPhone": "+91 427 234 6666",
    "website": "https://www.manipalhospitals.com/salem/",
    "rating": 4.6,
    "reviewsCount": 540,
    "specialties": ["Cardiology", "Cardiac Surgery", "Emergency Care"],
    "departments": ["Flat-Panel Cath Lab", "Intensive Cardiac Care", "Angioplasty & Pacemaker"],
    "isEmergency247": True,
    "isOpenNow": True,
    "operatingHours": "24 Hours Emergency | OPD: 8:30 AM - 6:30 PM",
    "mapsUrl": "https://www.google.com/maps/search/?api=1&query=Manipal+Hospital+Bangalore+Highway+Salem"
  },
  {
    "id": "tn-tri-01",
    "name": "Kauvery Hospital Heart Institute Trichy",
    "type": "Super Specialty Hospital",
    "state": "Tamil Nadu",
    "district": "Tiruchirappalli",
    "city": "Tiruchirappalli",
    "pincode": "620018",
    "address": "Tennur, Tiruchirappalli, Tamil Nadu 620018",
    "lat": 10.8158,
    "lng": 78.6872,
    "phone": "+91 431 407 7777",
    "emergencyPhone": "+91 431 407 7000",
    "website": "https://www.kauveryhospital.com/our-hospitals/trichy-tennur",
    "rating": 4.8,
    "reviewsCount": 910,
    "specialties": ["Cardiology", "Cardiac Surgery", "Emergency Care"],
    "departments": ["Cath Lab", "Open Heart Surgery", "Cardiac Electrophysiology"],
    "isEmergency247": True,
    "isOpenNow": True,
    "operatingHours": "24 Hours Emergency | OPD: 8:00 AM - 8:00 PM",
    "mapsUrl": "https://www.google.com/maps/search/?api=1&query=Kauvery+Hospital+Tennur+Trichy"
  },

  # ── KARNATAKA ──────────────────────────────────────────────────────────────
  {
    "id": "ka-blr-01",
    "name": "Sri Jayadeva Institute of Cardiovascular Sciences",
    "type": "Autonomous Autonomous Cardiac Institute",
    "state": "Karnataka",
    "district": "Bengaluru",
    "city": "Bengaluru",
    "pincode": "560069",
    "address": "Bannerghatta Road, 9th Block Jayanagar, Bengaluru, Karnataka 560069",
    "lat": 12.9172,
    "lng": 77.5975,
    "phone": "+91 80 2297 7400",
    "emergencyPhone": "+91 80 2297 7433",
    "website": "http://www.jayadevacardiology.com/",
    "rating": 4.8,
    "reviewsCount": 2400,
    "specialties": ["Cardiology", "Cardiac Surgery", "Emergency Care", "Electrophysiology"],
    "departments": ["Largest Asian Cath Lab Facility", "Heart Valve Replacement", "Pediatric Cardiac Unit"],
    "isEmergency247": True,
    "isOpenNow": True,
    "operatingHours": "24 Hours Emergency & ICCU | OPD: 8:00 AM - 4:00 PM",
    "mapsUrl": "https://www.google.com/maps/search/?api=1&query=Jayadeva+Institute+Bannerghatta+Road+Bengaluru"
  },
  {
    "id": "ka-blr-02",
    "name": "Narayana Health City (Narayana Institute of Cardiac Sciences)",
    "type": "Super Specialty Health City",
    "state": "Karnataka",
    "district": "Bengaluru",
    "city": "Bengaluru",
    "pincode": "560099",
    "address": "258/A, Bommasandra Industrial Area, Hosur Road, Bengaluru, Karnataka 560099",
    "lat": 12.8105,
    "lng": 77.6958,
    "phone": "+91 80 7122 2222",
    "emergencyPhone": "1800 309 0309",
    "website": "https://www.narayanahealth.org/hospitals/bengaluru/narayana-institute-cardiac-sciences-bommasandra",
    "rating": 4.9,
    "reviewsCount": 3100,
    "specialties": ["Cardiology", "Cardiac Surgery", "Emergency Care"],
    "departments": ["Pediatric & Adult Cardiac Surgery", "Heart Transplant", "Advanced Cath Labs"],
    "isEmergency247": True,
    "isOpenNow": True,
    "operatingHours": "24 Hours Emergency | OPD: 8:00 AM - 7:00 PM",
    "mapsUrl": "https://www.google.com/maps/search/?api=1&query=Narayana+Health+City+Bommasandra+Bengaluru"
  },
  {
    "id": "ka-blr-03",
    "name": "Manipal Hospital Cardiac Department",
    "type": "Super Specialty Medical Center",
    "state": "Karnataka",
    "district": "Bengaluru",
    "city": "Bengaluru",
    "pincode": "560017",
    "address": "98, HAL Old Airport Road, Kodihalli, Bengaluru, Karnataka 560017",
    "lat": 12.9582,
    "lng": 77.6492,
    "phone": "+91 80 2502 4444",
    "emergencyPhone": "+91 80 2502 3333",
    "website": "https://www.manipalhospitals.com/oldairportroad/",
    "rating": 4.7,
    "reviewsCount": 1850,
    "specialties": ["Cardiology", "Cardiac Surgery", "Emergency Care"],
    "departments": ["Robotic Heart Surgery", "Transcatheter Aortic Valve Implantation (TAVI)", "CCU"],
    "isEmergency247": True,
    "isOpenNow": True,
    "operatingHours": "24 Hours Emergency | OPD: 8:30 AM - 8:00 PM",
    "mapsUrl": "https://www.google.com/maps/search/?api=1&query=Manipal+Hospital+HAL+Old+Airport+Road+Bengaluru"
  },

  # ── TELANGANA & ANDHRA PRADESH ──────────────────────────────────────────────
  {
    "id": "ts-hyd-01",
    "name": "Yashoda Hospitals Heart Institute Somajiguda",
    "type": "Super Specialty Hospital",
    "state": "Telangana",
    "district": "Hyderabad",
    "city": "Hyderabad",
    "pincode": "500082",
    "address": "Raj Bhavan Road, Matha Nagar, Somajiguda, Hyderabad, Telangana 500082",
    "lat": 17.4245,
    "lng": 78.4589,
    "phone": "+91 40 4567 4567",
    "emergencyPhone": "+91 40 2331 0000",
    "website": "https://www.yashodahospitals.com/",
    "rating": 4.8,
    "reviewsCount": 1950,
    "specialties": ["Cardiology", "Cardiac Surgery", "Emergency Care"],
    "departments": ["Transradial Angioplasty", "Cardio-Thoracic Surgery", "Heart & Lung Transplant"],
    "isEmergency247": True,
    "isOpenNow": True,
    "operatingHours": "24 Hours Emergency | OPD: 8:00 AM - 8:00 PM",
    "mapsUrl": "https://www.google.com/maps/search/?api=1&query=Yashoda+Hospitals+Somajiguda+Hyderabad"
  },
  {
    "id": "ts-hyd-02",
    "name": "Apollo Hospitals Jubilee Hills Cardiac Center",
    "type": "Tertiary Care Hospital",
    "state": "Telangana",
    "district": "Hyderabad",
    "city": "Hyderabad",
    "pincode": "500033",
    "address": "Road No. 72, Film Nagar, Jubilee Hills, Hyderabad, Telangana 500033",
    "lat": 17.4285,
    "lng": 78.4095,
    "phone": "+91 40 2360 7777",
    "emergencyPhone": "1066 / +91 40 2360 7106",
    "website": "https://hyderabad.apollohospitals.com/",
    "rating": 4.8,
    "reviewsCount": 2100,
    "specialties": ["Cardiology", "Cardiac Surgery", "Emergency Care"],
    "departments": ["3D Mapping Electrophysiology", "TAVI & Structural Heart Clinic", "Cardiology ICU"],
    "isEmergency247": True,
    "isOpenNow": True,
    "operatingHours": "24 Hours Emergency | OPD: 8:00 AM - 7:30 PM",
    "mapsUrl": "https://www.google.com/maps/search/?api=1&query=Apollo+Hospitals+Jubilee+Hills+Hyderabad"
  },

  # ── MAHARASHTRA ────────────────────────────────────────────────────────────
  {
    "id": "mh-mum-01",
    "name": "Asian Heart Institute & Research Centre",
    "type": "Specialized Heart Hospital",
    "state": "Maharashtra",
    "district": "Mumbai",
    "city": "Mumbai",
    "pincode": "400051",
    "address": "G/N Block, Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra 400051",
    "lat": 19.0664,
    "lng": 72.8642,
    "phone": "+91 22 6698 6666",
    "emergencyPhone": "+91 22 6698 6500",
    "website": "https://asianheartinstitute.org/",
    "rating": 4.9,
    "reviewsCount": 1620,
    "specialties": ["Cardiology", "Cardiac Surgery", "Emergency Care"],
    "departments": ["Complex Coronary Bypass Surgery", "Pediatric Heart Surgery", "Preventive Cardiology"],
    "isEmergency247": True,
    "isOpenNow": True,
    "operatingHours": "24 Hours Emergency | OPD: 9:00 AM - 6:00 PM",
    "mapsUrl": "https://www.google.com/maps/search/?api=1&query=Asian+Heart+Institute+BKC+Mumbai"
  },
  {
    "id": "mh-mum-02",
    "name": "Kokilaben Dhirubhai Ambani Hospital Cardiac Sciences",
    "type": "Super Specialty Hospital",
    "state": "Maharashtra",
    "district": "Mumbai",
    "city": "Mumbai",
    "pincode": "400053",
    "address": "Rao Saheb Achutrao Patwardhan Marg, Four Bungalows, Andheri West, Mumbai, Maharashtra 400053",
    "lat": 19.1312,
    "lng": 72.8256,
    "phone": "+91 22 4269 6969",
    "emergencyPhone": "+91 22 4269 9999",
    "website": "https://www.kokilabenhospital.com/",
    "rating": 4.8,
    "reviewsCount": 2300,
    "specialties": ["Cardiology", "Cardiac Surgery", "Emergency Care"],
    "departments": ["Full Time Specialist System", "Minimally Invasive Cardiac Surgery", "Advanced Echo"],
    "isEmergency247": True,
    "isOpenNow": True,
    "operatingHours": "24 Hours Emergency | OPD: 8:00 AM - 8:00 PM",
    "mapsUrl": "https://www.google.com/maps/search/?api=1&query=Kokilaben+Hospital+Andheri+West+Mumbai"
  },

  # ── DELHI NCR ──────────────────────────────────────────────────────────────
  {
    "id": "dl-del-01",
    "name": "Fortis Escorts Heart Institute (FEHI)",
    "type": "Premier Cardiac Institute",
    "state": "Delhi NCR",
    "district": "South Delhi",
    "city": "Delhi",
    "pincode": "110025",
    "address": "Okhla Road, New Friends Colony, New Delhi, Delhi 110025",
    "lat": 28.5612,
    "lng": 77.2715,
    "phone": "+91 11 4713 5000",
    "emergencyPhone": "+91 11 105010",
    "website": "https://www.fortishealthcare.com/location/fortis-escorts-heart-institute-new-delhi",
    "rating": 4.9,
    "reviewsCount": 2800,
    "specialties": ["Cardiology", "Cardiac Surgery", "Emergency Care", "Electrophysiology"],
    "departments": ["Pioneer in Interventional Cardiology", "Pediatric Congenital Heart Care", "CCU"],
    "isEmergency247": True,
    "isOpenNow": True,
    "operatingHours": "24 Hours Emergency | OPD: 8:00 AM - 7:00 PM",
    "mapsUrl": "https://www.google.com/maps/search/?api=1&query=Fortis+Escorts+Heart+Institute+Okhla+Delhi"
  },
  {
    "id": "dl-del-02",
    "name": "All India Institute of Medical Sciences (AIIMS) Dept of Cardiology",
    "type": "National Apex Public Institute",
    "state": "Delhi NCR",
    "district": "New Delhi",
    "city": "Delhi",
    "pincode": "110029",
    "address": "Sri Aurobindo Marg, Ansari Nagar, New Delhi, Delhi 110029",
    "lat": 28.5672,
    "lng": 77.2100,
    "phone": "+91 11 2658 8500",
    "emergencyPhone": "+91 11 2658 8700",
    "website": "https://www.aiims.edu/",
    "rating": 4.8,
    "reviewsCount": 4200,
    "specialties": ["Cardiology", "Cardiac Surgery", "Emergency Care"],
    "departments": ["Cardio-Thoracic Centre (CTC)", "Coronary Care Unit", "Heart Failure Clinic"],
    "isEmergency247": True,
    "isOpenNow": True,
    "operatingHours": "24 Hours Emergency | OPD: 8:00 AM - 2:00 PM",
    "mapsUrl": "https://www.google.com/maps/search/?api=1&query=AIIMS+Cardiology+Ansari+Nagar+Delhi"
  },
  {
    "id": "hr-gur-01",
    "name": "Medanta The Medicity Heart Institute",
    "type": "Super Specialty Health Institute",
    "state": "Delhi NCR",
    "district": "Gurugram",
    "city": "Gurugram",
    "pincode": "122001",
    "address": "CH Baktawar Singh Road, Sector 38, Gurugram, Haryana 122001",
    "lat": 28.4385,
    "lng": 77.0425,
    "phone": "+91 124 414 1414",
    "emergencyPhone": "+91 124 1068",
    "website": "https://www.medanta.org/",
    "rating": 4.9,
    "reviewsCount": 3500,
    "specialties": ["Cardiology", "Cardiac Surgery", "Emergency Care"],
    "departments": ["Hybrid Cath Lab", "Minimally Invasive Valve Surgery", "VAD & Transplant"],
    "isEmergency247": True,
    "isOpenNow": True,
    "operatingHours": "24 Hours Emergency | OPD: 8:30 AM - 7:30 PM",
    "mapsUrl": "https://www.google.com/maps/search/?api=1&query=Medanta+The+Medicity+Gurugram"
  }
]

# Haversine distance calculator
def calculate_haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * Math_atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)

def Math_atan2(y, x):
    return math.atan2(y, x)

def search_indian_cardiac_hospitals(
    query: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    pincode: Optional[str] = None,
    specialty: Optional[str] = None,
    emergency_only: bool = False,
    user_lat: Optional[float] = None,
    user_lng: Optional[float] = None
) -> List[Dict[str, Any]]:
    results = []

    for hosp in INDIAN_CARDIAC_HOSPITALS:
        # State filter
        if state and state.upper() != "ALL":
            if hosp["state"].lower() != state.lower():
                continue

        # District / City filter
        if district and district.strip():
            d_query = district.strip().lower()
            if d_query not in hosp["district"].lower() and d_query not in hosp["city"].lower():
                continue

        # Pincode filter
        if pincode and pincode.strip():
            p_query = pincode.strip().lower()
            if p_query not in hosp["pincode"] and p_query not in hosp["address"]:
                continue

        # General search query (City, District, Name, Address, Pincode)
        if query and query.strip():
            q = query.strip().lower()
            match_name = q in hosp["name"].lower()
            match_city = q in hosp["city"].lower()
            match_district = q in hosp["district"].lower()
            match_state = q in hosp["state"].lower()
            match_addr = q in hosp["address"].lower()
            match_pin = q in hosp["pincode"]
            if not (match_name or match_city or match_district or match_state or match_addr or match_pin):
                continue

        # Specialty filter
        if specialty and specialty.upper() != "ALL":
            if specialty not in hosp["specialties"]:
                continue

        # Emergency 24/7 filter
        if emergency_only and not hosp["isEmergency247"]:
            continue

        # Compute distance if user coordinates provided
        h_copy = dict(hosp)
        if user_lat is not None and user_lng is not None:
            h_copy["distance"] = calculate_haversine(user_lat, user_lng, hosp["lat"], hosp["lng"])
        else:
            h_copy["distance"] = None

        results.append(h_copy)

    # Sort results
    if user_lat is not None and user_lng is not None:
        results.sort(key=lambda x: (x["distance"] if x["distance"] is not None else 9999, -x["rating"]))
    else:
        results.sort(key=lambda x: -x["rating"])

    return results
