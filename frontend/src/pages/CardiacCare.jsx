import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Disclaimer } from '../components/Disclaimer';
import {
  Hospital, MapPin, Search, Navigation, Phone, Clock, Star,
  ShieldCheck, AlertTriangle, ExternalLink, X, Filter, CheckCircle2, HeartPulse, Globe, RefreshCw
} from 'lucide-react';

const INDIAN_STATES = [
  'ALL',
  'Tamil Nadu',
  'Karnataka',
  'Telangana',
  'Maharashtra',
  'Delhi NCR',
  'Kerala',
  'Andhra Pradesh',
  'West Bengal',
  'Gujarat'
];

const QUICK_CITIES = [
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Salem',
  'Tiruchirappalli',
  'Bengaluru',
  'Hyderabad',
  'Mumbai',
  'Delhi'
];

export const CardiacCare = () => {
  const { t } = useLanguage();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');
  const [districtInput, setDistrictInput] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'

  // Location state
  const [userCoords, setUserCoords] = useState(null); // { lat, lng }
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState(null);

  // Results state
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);

  // Fetch hospitals from API service backend
  const loadHospitals = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        query: searchQuery,
        state: selectedState !== 'ALL' ? selectedState : undefined,
        district: districtInput.trim() ? districtInput.trim() : undefined,
        specialty: selectedSpecialty !== 'ALL' ? selectedSpecialty : undefined,
        emergency_only: emergencyOnly,
        lat: userCoords?.lat,
        lng: userCoords?.lng,
      };

      const res = await api.searchCardiacHospitals(params);
      setHospitals(res.hospitals || []);
    } catch (err) {
      console.error('Failed to load hospitals:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedState, districtInput, selectedSpecialty, emergencyOnly, userCoords]);

  useEffect(() => {
    loadHospitals();
  }, [loadHospitals]);

  // Request browser geolocation
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser. Please enter location manually.');
      return;
    }
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setLocError('Location permission denied or unavailable. Please enter your State, City, or PIN code manually below.');
        setLocating(false);
      },
      { timeout: 8000 }
    );
  };

  const handleQuickCityClick = (cityName) => {
    setSearchQuery(cityName);
    setDistrictInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 1150, color: '#f8fafc' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Hospital color="#38bdf8" size={28} />
          {t('cardiac.title')}
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
          {t('cardiac.subtitle')}
        </p>
      </div>

      {/* Mandatory Required Non-Clinical Wording Disclaimer Banner */}
      <div style={{
        background: 'rgba(56,189,248,0.12)',
        border: '1px solid rgba(56,189,248,0.3)',
        borderRadius: 12,
        padding: '0.9rem 1.25rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        color: '#38bdf8'
      }}>
        <ShieldCheck size={20} color="#38bdf8" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
          <strong>Notice:</strong> {t('cardiac.disclaimer_banner')}
        </div>
      </div>

      {/* Search & Multi-Location Filter Section */}
      <div className="glass-card" style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        {/* Top Row: Search Input & Geolocation */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Location Search Input */}
          <div style={{ flex: 2, minWidth: 280, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.4rem', height: '42px', fontSize: '0.875rem', width: '100%' }}
              placeholder={t('cardiac.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Use My Location Button */}
          <button
            onClick={handleUseLocation}
            disabled={locating}
            className="btn-secondary"
            style={{ height: '42px', padding: '0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
          >
            <Navigation size={16} className={locating ? 'animate-spin' : ''} color="#38bdf8" />
            {locating ? 'Locating...' : t('cardiac.btn_use_location')}
          </button>

          {/* View Switcher Toggle */}
          <div style={{ display: 'flex', background: '#0f172a', borderRadius: 8, padding: 3, height: '42px', alignItems: 'center', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setViewMode('list')}
              style={{
                height: '36px',
                padding: '0 0.85rem',
                border: 'none',
                borderRadius: 6,
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: viewMode === 'list' ? '#1e293b' : 'transparent',
                color: viewMode === 'list' ? '#38bdf8' : '#94a3b8',
                boxShadow: viewMode === 'list' ? '0 2px 6px rgba(0,0,0,0.3)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              📋 {t('cardiac.view_list')}
            </button>
            <button
              onClick={() => setViewMode('map')}
              style={{
                height: '36px',
                padding: '0 0.85rem',
                border: 'none',
                borderRadius: 6,
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: viewMode === 'map' ? '#1e293b' : 'transparent',
                color: viewMode === 'map' ? '#38bdf8' : '#94a3b8',
                boxShadow: viewMode === 'map' ? '0 2px 6px rgba(0,0,0,0.3)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              🗺️ {t('cardiac.view_map')}
            </button>
          </div>
        </div>

        {/* Location Error / Manual Entry Warning */}
        {locError && (
          <div style={{ fontSize: '0.8rem', color: '#fb7185', background: 'rgba(251,113,133,0.12)', border: '1px solid rgba(251,113,133,0.3)', padding: '0.5rem 0.85rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertTriangle size={15} /> {locError}
          </div>
        )}

        {/* Second Row: State Dropdown & District Input */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 4, display: 'block' }}>
              📍 {t('cardiac.select_state')}
            </label>
            <select
              className="form-select"
              style={{ height: '38px', fontSize: '0.85rem' }}
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st} style={{ background: '#1e293b', color: '#fff' }}>{st === 'ALL' ? t('cardiac.all_states') : st}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 4, display: 'block' }}>
              🏙️ District / City
            </label>
            <input
              type="text"
              className="form-input"
              style={{ height: '38px', fontSize: '0.85rem' }}
              placeholder={t('cardiac.district_placeholder')}
              value={districtInput}
              onChange={(e) => setDistrictInput(e.target.value)}
            />
          </div>
        </div>

        {/* Quick Location Chips Shortcut */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
            {t('cardiac.quick_searches')}
          </span>
          {QUICK_CITIES.map((city) => (
            <button
              key={city}
              onClick={() => handleQuickCityClick(city)}
              style={{
                padding: '0.2rem 0.6rem',
                borderRadius: 16,
                border: searchQuery.toLowerCase() === city.toLowerCase() ? '1px solid #38bdf8' : '1px solid var(--border-color)',
                background: searchQuery.toLowerCase() === city.toLowerCase() ? 'rgba(56, 189, 248, 0.15)' : '#0f172a',
                color: searchQuery.toLowerCase() === city.toLowerCase() ? '#38bdf8' : '#cbd5e1',
                fontSize: '0.75rem',
                fontWeight: searchQuery.toLowerCase() === city.toLowerCase() ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Third Row: Specialty & Emergency Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem', marginRight: '0.25rem' }}>
            <Filter size={14} /> Medical Filters:
          </span>

          {[
            { id: 'ALL', label: t('cardiac.filter_all_specialties') },
            { id: 'Cardiology', label: t('cardiac.filter_cardiology') },
            { id: 'Cardiac Surgery', label: t('cardiac.filter_surgery') },
          ].map((spec) => (
            <button
              key={spec.id}
              onClick={() => setSelectedSpecialty(spec.id)}
              style={{
                padding: '0.3rem 0.75rem',
                borderRadius: 20,
                border: selectedSpecialty === spec.id ? '1px solid #38bdf8' : '1px solid var(--border-color)',
                background: selectedSpecialty === spec.id ? 'rgba(56, 189, 248, 0.15)' : '#0f172a',
                color: selectedSpecialty === spec.id ? '#38bdf8' : '#cbd5e1',
                fontSize: '0.78rem',
                fontWeight: selectedSpecialty === spec.id ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {spec.label}
            </button>
          ))}

          {/* Emergency 24/7 Filter Button */}
          <button
            onClick={() => setEmergencyOnly((e) => !e)}
            style={{
              marginLeft: 'auto',
              padding: '0.3rem 0.75rem',
              borderRadius: 20,
              border: emergencyOnly ? '1px solid #fb7185' : '1px solid var(--border-color)',
              background: emergencyOnly ? 'rgba(251,113,133,0.15)' : '#0f172a',
              color: emergencyOnly ? '#fb7185' : '#cbd5e1',
              fontSize: '0.78rem',
              fontWeight: emergencyOnly ? 600 : 400,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            🚨 {t('cardiac.filter_emergency')} {emergencyOnly && <CheckCircle2 size={13} color="#fb7185" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <RefreshCw size={28} className="animate-spin" color="#38bdf8" />
          <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Searching cardiac care centers across India...</span>
        </div>
      ) : viewMode === 'map' ? (
        /* Interactive Visual Map View */
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="#38bdf8" /> Interactive Map View ({hospitals.length} Facilities)
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Click a facility marker to view full specs</span>
          </div>

          <div style={{
            position: 'relative',
            height: 400,
            background: '#0f172a',
            borderRadius: 12,
            border: '1px solid var(--border-color)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* SVG Grid Pattern */}
            <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.15 }}>
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#38bdf8" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Simulated Geographic Routes */}
            <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
              <path d="M 100,50 Q 300,120 500,200 T 900,350" fill="none" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="6" />
              <path d="M 50,300 Q 250,220 600,150 T 1000,100" fill="none" stroke="rgba(45, 212, 191, 0.3)" strokeWidth="4" />
            </svg>

            {/* Pins for each hospital */}
            {hospitals.map((hosp, i) => {
              const topPct = Math.max(15, Math.min(80, 50 + (18.5 - hosp.lat) * 12));
              const leftPct = Math.max(12, Math.min(85, 45 + (hosp.lng - 77.0) * 8));
              const isSelected = selectedHospital?.id === hosp.id;

              return (
                <div
                  key={hosp.id}
                  onClick={() => setSelectedHospital(hosp)}
                  style={{
                    position: 'absolute',
                    top: `${topPct}%`,
                    left: `${leftPct}%`,
                    transform: 'translate(-50%, -100%)',
                    cursor: 'pointer',
                    zIndex: isSelected ? 20 : 10,
                    transition: 'transform 0.2s ease'
                  }}
                  title={hosp.name}
                >
                  <div style={{
                    background: isSelected ? '#0284c7' : hosp.isEmergency247 ? '#fb7185' : '#2dd4bf',
                    color: '#ffffff',
                    padding: '0.35rem 0.65rem',
                    borderRadius: 20,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    whiteSpace: 'nowrap',
                    border: '2px solid #0f172a'
                  }}>
                    <HeartPulse size={14} />
                    <span>#{i + 1} {hosp.name.split(' ')[0]} ({hosp.city})</span>
                  </div>
                  <div style={{
                    width: 0,
                    height: 0,
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: `8px solid ${isSelected ? '#0284c7' : hosp.isEmergency247 ? '#fb7185' : '#2dd4bf'}`,
                    margin: '0 auto'
                  }} />
                </div>
              );
            })}

            {/* Selected Hospital Floating Preview Card */}
            {selectedHospital && (
              <div style={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                right: 16,
                background: '#1e293b',
                padding: '1rem 1.25rem',
                borderRadius: 10,
                boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                gap: '1rem',
                border: '1px solid rgba(255,255,255,0.12)',
                zIndex: 30
              }}>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
                    {selectedHospital.type} • {selectedHospital.city}, {selectedHospital.state}
                  </span>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>{selectedHospital.name}</h4>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '2px 0' }}>{selectedHospital.address}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <button
                    onClick={() => setSelectedHospital(selectedHospital)}
                    className="btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
                  >
                    {t('cardiac.btn_view_details')}
                  </button>
                  <a
                    href={selectedHospital.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary"
                    style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem', textDecoration: 'none' }}
                  >
                    <ExternalLink size={14} /> {t('cardiac.btn_get_directions')}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* List View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {hospitals.length === 0 ? (
            /* Empty State */
            <div className="glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center', gridColumn: '1 / -1', background: 'var(--bg-card)' }}>
              <Hospital size={44} color="#64748b" style={{ marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                {t('cardiac.empty_title')}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: 6, maxWidth: 500, margin: '6px auto 0' }}>
                {t('cardiac.empty_desc')}
              </p>
            </div>
          ) : (
            hospitals.map((hosp, idx) => (
              <div
                key={hosp.id}
                className="glass-card"
                style={{
                  padding: '1.4rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  position: 'relative',
                  borderTop: `4px solid ${hosp.isEmergency247 ? '#38bdf8' : '#2dd4bf'}`
                }}
              >
                {/* Top Badge Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: 12,
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    {hosp.type}
                  </span>

                  {hosp.distance !== null && (
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#34d399', background: 'rgba(52, 211, 153, 0.15)', padding: '0.2rem 0.6rem', borderRadius: 12, border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                      📍 {t('cardiac.distance_away', { distance: hosp.distance })}
                    </span>
                  )}
                </div>

                {/* Name & Location */}
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.35, marginBottom: '0.35rem' }}>
                    {hosp.name}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#e2e8f0', display: 'flex', alignItems: 'flex-start', gap: '0.35rem', lineHeight: 1.4 }}>
                    <MapPin size={15} color="#38bdf8" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{hosp.address}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginTop: 4 }}>
                    📍 {hosp.city}, {hosp.state} — {hosp.pincode}
                  </div>
                </div>

                {/* Rating & Emergency Tag */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.78rem', paddingTop: '0.25rem' }}>
                  <span style={{ fontWeight: 600, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Star size={14} fill="#fbbf24" color="#fbbf24" />
                    {hosp.rating} ({hosp.reviewsCount} verified reviews)
                  </span>

                  <span style={{
                    fontWeight: 600,
                    fontSize: '0.72rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: 6,
                    background: hosp.isEmergency247 ? 'rgba(251,113,133,0.15)' : '#0f172a',
                    color: hosp.isEmergency247 ? '#fb7185' : '#94a3b8',
                    border: hosp.isEmergency247 ? '1px solid rgba(251,113,133,0.3)' : '1px solid var(--border-color)'
                  }}>
                    {hosp.isEmergency247 ? `🚨 24/7 Emergency` : `Standard OPD`}
                  </span>
                </div>

                {/* Specialties Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.1rem' }}>
                  {hosp.specialties.map((spec) => (
                    <span key={spec} style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: 4, background: '#0f172a', color: '#e2e8f0', fontWeight: 500, border: '1px solid var(--border-color)' }}>
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.65rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                  <button
                    onClick={() => setSelectedHospital(hosp)}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', justifyContent: 'center' }}
                  >
                    {t('cardiac.btn_view_details')}
                  </button>
                  <a
                    href={hosp.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary"
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', justifyContent: 'center', textDecoration: 'none' }}
                  >
                    <ExternalLink size={14} />
                    {t('cardiac.btn_get_directions')}
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Hospital Detail Modal */}
      {selectedHospital && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(11, 15, 25, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          zIndex: 100,
          padding: '1.5rem'
        }}>
          <div className="glass-card" style={{ maxWidth: 620, width: '100%', padding: '1.75rem', background: '#1e293b', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
                  {selectedHospital.type} • {selectedHospital.city}, {selectedHospital.state}
                </span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginTop: 2 }}>{selectedHospital.name}</h2>
              </div>
              <button
                onClick={() => setSelectedHospital(null)}
                style={{ background: '#0f172a', border: '1px solid var(--border-color)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#e2e8f0', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <MapPin size={16} color="#38bdf8" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div>{selectedHospital.address}</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
                  PIN Code: {selectedHospital.pincode} | District: {selectedHospital.district}
                </div>
              </div>
            </div>

            {/* Emergency Hotline Banner */}
            <div style={{ background: 'rgba(251,113,133,0.15)', border: '1px solid rgba(251,113,133,0.3)', borderRadius: 8, padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fb7185', textTransform: 'uppercase' }}>🚨 Emergency &amp; Helpline Contact</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>{selectedHospital.emergencyPhone}</div>
              </div>
              <a href={`tel:${selectedHospital.emergencyPhone}`} className="btn-primary" style={{ background: '#fb7185', fontSize: '0.8rem', padding: '0.4rem 0.85rem', textDecoration: 'none' }}>
                <Phone size={14} /> Call Emergency
              </a>
            </div>

            {/* Website Link */}
            {selectedHospital.website && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem' }}>
                <Globe size={15} color="#38bdf8" />
                <span style={{ fontWeight: 600, color: '#cbd5e1' }}>Website:</span>
                <a href={selectedHospital.website} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'underline' }}>
                  {selectedHospital.website}
                </a>
              </div>
            )}

            {/* Operating Hours */}
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={15} color="#38bdf8" /> {t('cardiac.modal_title')}
              </h4>
              <p style={{ fontSize: '0.825rem', color: '#e2e8f0' }}>{selectedHospital.operatingHours}</p>
            </div>

            {/* Key Services & Departments */}
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
                {t('cardiac.modal_services')}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                {selectedHospital.departments.map((dept) => (
                  <div key={dept} style={{ background: '#0f172a', padding: '0.5rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-color)', fontSize: '0.8rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckCircle2 size={14} color="#34d399" /> {dept}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
              <button onClick={() => setSelectedHospital(null)} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
                {t('cardiac.modal_close')}
              </button>
              <a href={selectedHospital.mapsUrl} target="_blank" rel="noreferrer" className="btn-primary" style={{ fontSize: '0.85rem', textDecoration: 'none' }}>
                <ExternalLink size={15} /> {t('cardiac.btn_get_directions')}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Global Medical Disclaimer */}
      <Disclaimer />
    </div>
  );
};
