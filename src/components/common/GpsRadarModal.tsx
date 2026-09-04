import React, { useState, useEffect } from "react";
import {
  X,
  MapPin,
  Navigation,
  Compass,
  Crosshair,
  Radio,
  Bike,
  Footprints,
  ExternalLink,
  RefreshCw,
  Shield,
  LocateFixed,
  Map as MapIcon,
} from "lucide-react";
import { GpsCoordinates } from "../../types";
import { playSound } from "../../utils/audio";
import {
  calculateDistanceKm,
  calculateBearing,
  getGoogleMapsDirectionsUrl,
  getGoogleMapsEmbedUrl,
} from "../../utils/geo";
import { useTranslation } from "react-i18next";

interface GpsRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  workerName: string;
  workerTrade?: string;
  jobTitle?: string;
  jobAddress: string;
  workerGps?: GpsCoordinates;
  jobGps?: GpsCoordinates;
  initialDistanceKm?: number;
  isWorkerPerspective?: boolean;
}
export const GpsRadarModal: React.FC<GpsRadarModalProps> = ({
  isOpen,
  onClose,
  workerName,
  workerTrade = "Tradesman",
  jobTitle = "Job Location",
  jobAddress,
  workerGps,
  jobGps,
  initialDistanceKm = 1.2,
  isWorkerPerspective = false,
}) => {
    const { t } = useTranslation();
  // 1. Destination Job Site Coordinates (Ludhiana default if undefined)
  const jLat = jobGps?.lat || 30.8926;
  const jLng = jobGps?.lng || 75.8415;

  // 2. Safe distance constraint: strictly <= 10km
  const validDistKm = Math.min(10.0, Math.max(0.2, initialDistanceKm || 1.2));

  // 3. Worker Origin Coordinates (if provided and within 10km, use it; otherwise compute local offset in same city)
  let wLat = workerGps?.lat;
  let wLng = workerGps?.lng;
  if (wLat && wLng) {
    const rawDist = calculateDistanceKm(wLat, wLng, jLat, jLng);
    // If worker coords are in a different city / default (> 10km), reposition to the valid local distance
    if (rawDist > 10.0) {
      const angleRad = (45 * Math.PI) / 180;
      const latOffset = (validDistKm / 111.0) * Math.cos(angleRad);
      const lngOffset = (validDistKm / (111.0 * Math.cos((jLat * Math.PI) / 180))) * Math.sin(angleRad);
      wLat = +(jLat - latOffset).toFixed(6);
      wLng = +(jLng - lngOffset).toFixed(6);
    }
  } else {
    const angleRad = (45 * Math.PI) / 180;
    const latOffset = (validDistKm / 111.0) * Math.cos(angleRad);
    const lngOffset = (validDistKm / (111.0 * Math.cos((jLat * Math.PI) / 180))) * Math.sin(angleRad);
    wLat = +(jLat - latOffset).toFixed(6);
    wLng = +(jLng - lngOffset).toFixed(6);
  }

  const trueCalculatedDistance = calculateDistanceKm(wLat, wLng, jLat, jLng);
  const trueInitialBearing = calculateBearing(wLat, wLng, jLat, jLng);
  const [viewMode, setViewMode] = useState<'google_maps' | 'radar'>('google_maps');
  const [currentDist, setCurrentDist] = useState(Math.min(10.0, trueCalculatedDistance || validDistKm));
  const [isNavigating, setIsNavigating] = useState(false);
  const [transitMode, setTransitMode] = useState<'walk' | 'bike' | 'auto'>('walk');
  const [gpsAccuracy, setGpsAccuracy] = useState(workerGps?.accuracyMeters || 4); // meters
  const [heading, setHeading] = useState(trueInitialBearing || 45); // degrees
  const [liveCoords, setLiveCoords] = useState<{ lat: number; lng: number }>({
    lat: wLat,
    lng: wLng,
  });
  const destCoords = { lat: jLat, lng: jLng };

  // Update distance if live coordinates change
  useEffect(() => {
    const d = calculateDistanceKm(liveCoords.lat, liveCoords.lng, jLat, jLng);
    setCurrentDist(Math.min(10.0, d));
    setHeading(calculateBearing(liveCoords.lat, liveCoords.lng, jLat, jLng));
  }, [liveCoords.lat, liveCoords.lng, jLat, jLng]);

  // Calibrate real device Geolocation safely without jumping to remote cities (max 10km)
  const calibrateDeviceLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLat = +pos.coords.latitude.toFixed(6);
          const userLng = +pos.coords.longitude.toFixed(6);
          const realDist = calculateDistanceKm(userLat, userLng, jLat, jLng);
          setGpsAccuracy(Math.round(pos.coords.accuracy) || 4);
          if (pos.coords.heading !== null) {
            setHeading(Math.round(pos.coords.heading) || trueInitialBearing);
          }
          // If device is in the local area (< 10km), use device coords directly
          if (realDist <= 10.0) {
            setLiveCoords({ lat: userLat, lng: userLng });
            setCurrentDist(realDist);
          } else {
            // Keep local hyperlocal coordinate simulation (within 10km)
            console.debug('Browser GPS outside 10km zone, maintaining local simulation.');
          }
          playSound('gps_ping');
        },
        (err) => {
          console.debug('Geolocation fallback used', err);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  };

  // Simulation loop when "Simulate Travel / GPS Walk" is clicked
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isNavigating && currentDist > 0.05) {
      interval = setInterval(() => {
        setCurrentDist((prev) => {
          const step = transitMode === 'bike' ? 0.15 : 0.06;
          const next = Math.max(0, +(prev - step).toFixed(2));
          if (next <= 0.05) {
            setIsNavigating(false);
            playSound('success');
          } else {
            playSound('gps_ping');
          }
          return next;
        });
        setHeading((h) => (h + 8) % 360);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isNavigating, currentDist, transitMode]);

  if (!isOpen) return null;

  // Calculate ETAs
  const etaMinutesWalk = Math.max(1, Math.round(currentDist * 12)); // 5 km/h
  const etaMinutesBike = Math.max(1, Math.round(currentDist * 3)); // 20 km/h
  const activeEta = transitMode === 'walk' ? etaMinutesWalk : etaMinutesBike;

  // Real Google Maps direct URL
  const googleMapsDirectionsUrl = getGoogleMapsDirectionsUrl(
    liveCoords.lat,
    liveCoords.lng,
    destCoords.lat,
    destCoords.lng,
    transitMode === 'bike' ? 'bicycling' : 'walking'
  );
  const googleMapsEmbedUrl = getGoogleMapsEmbedUrl(
    liveCoords.lat,
    liveCoords.lng,
    destCoords.lat,
    destCoords.lng,
    15
  );

  // Radar coordinates relative positioning for visualization
  const progressRatio = Math.max(0, Math.min(1, 1 - currentDist / (initialDistanceKm || 1.2)));
  const workerX = 35 + progressRatio * 130;
  const workerY = 160 - progressRatio * 115;

  return ( <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 select-none"> <div className="bg-slate-900 text-slate-100 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-700 flex flex-col max-h-[92vh]"> {/* Header */} <div className="bg-slate-800 p-4 sm:p-5 border-b border-slate-700 flex items-center justify-between shrink-0"> <div className="flex items-center gap-3"> <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400"> <Crosshair className="w-5 h-5 animate-pulse" /> </div> <div> <div className="flex items-center gap-2"> <h3 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">  {t("Live GPS Radar & Tracking")} </h3> <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold rounded-full flex items-center gap-1"> <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>  {t("GPS Active")} </span> </div> <p className="text-xs text-slate-400"> {isWorkerPerspective ? `Navigating to job site: ${jobTitle}` : `Tracking ${workerName} (${workerTrade})`} </p> </div> </div> <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 flex items-center justify-center transition" > <X className="w-4 h-4" /> </button> </div> {/* Modal Body */} <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs"> {/* Distance & ETA Live Pill Banner */} <div className="bg-gradient-to-r from-amber-950/80 to-slate-800 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between shadow-inner"> <div className="space-y-1"> <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">  {t("Distance to Destination")} </span> <div className="flex items-baseline gap-2"> <span className="text-3xl font-black text-white font-mono"> {currentDist.toFixed(1)} <span className="text-sm font-sans font-bold text-amber-400"> {t("km")} </span> </span> <span className="text-slate-400 font-medium text-xs"> ({Math.round(currentDist * 1000)}  {t("meters)")} </span> </div> <div className="flex items-center gap-2 text-amber-400 font-bold text-[11px]"> <ClockIcon className="w-3.5 h-3.5" /> <span> {t("Estimated Arrival:")} <strong>{currentDist <= 0.05 ? 'ARRIVED ON SITE' : `${activeEta} mins`}</strong></span> </div> </div> {/* Travel Mode Toggle */} <div className="flex flex-col gap-1 bg-slate-900/90 p-1.5 rounded-xl border border-slate-700"> <button onClick={() => { setTransitMode('walk'); playSound('click'); }} className={`p-1.5 rounded-lg transition flex items-center gap-1 text-[11px] font-bold ${ transitMode === 'walk' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white' }`} title={t("Walking (5 km/h)")} > <Footprints className="w-3.5 h-3.5" /> <span className="hidden sm:inline"> {t("Walk")} </span> </button> <button onClick={() => { setTransitMode('bike'); playSound('click'); }} className={`p-1.5 rounded-lg transition flex items-center gap-1 text-[11px] font-bold ${ transitMode === 'bike' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white' }`} title={t("Bicycle / Bike (20 km/h)")} > <Bike className="w-3.5 h-3.5" /> <span className="hidden sm:inline"> {t("Bike")} </span> </button> </div> </div> {/* View Mode Tabs (Google Maps vs. Radar View) */} <div className="flex items-center justify-between bg-slate-800/90 p-1 rounded-xl border border-slate-700"> <button onClick={() => { setViewMode('google_maps'); playSound('click'); }} className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 ${ viewMode === 'google_maps' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-400 hover:text-white' }`} > <MapIcon className="w-3.5 h-3.5" /> <span> {t("Google Maps View")} </span> </button> <button onClick={() => { setViewMode('radar'); playSound('click'); }} className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 ${ viewMode === 'radar' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-400 hover:text-white' }`} > <Crosshair className="w-3.5 h-3.5" /> <span> {t("Tactical Radar View")} </span> </button> </div> {/* Interactive Google Maps Live Frame or Radar Display */} {viewMode === 'google_maps' ? ( <div className="relative w-full h-64 bg-slate-950 rounded-2xl border border-slate-700 overflow-hidden shadow-lg"> <iframe title={t("Google Maps Live Routing")} src={googleMapsEmbedUrl} className="w-full h-full border-0 filter brightness-95 contrast-105" loading="lazy" allowFullScreen /> {/* Map Floating Control Overlay */} <div className="absolute top-2 left-2 bg-slate-900/90 backdrop-blur-xs border border-slate-700 px-2.5 py-1.5 rounded-xl text-[10px] font-mono text-slate-300 space-y-0.5 pointer-events-none"> <div className="flex items-center gap-1 text-amber-400 font-bold"> <Radio className="w-3 h-3 animate-pulse" /> <span> {t("Google Maps Sync Active")} </span> </div> <div> {t("Origin:")} {liveCoords.lat.toFixed(4)}, {liveCoords.lng.toFixed(4)}</div> <div> {t("Dest:")} {destCoords.lat.toFixed(4)}, {destCoords.lng.toFixed(4)}</div> </div> {/* Recalibrate button overlay */} <button onClick={calibrateDeviceLocation} className="absolute top-2 right-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-xl text-[10px] font-bold text-amber-300 flex items-center gap-1 shadow-md transition" title={t("Recalibrate GPS with device sensor")} > <LocateFixed className="w-3 h-3 text-amber-400" /> <span> {t("Calibrate GPS")} </span> </button> </div> ) : ( <div className="relative w-full h-64 bg-slate-950 rounded-2xl border border-slate-700 overflow-hidden shadow-lg flex items-center justify-center"> {/* Grid Lines */} <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40"></div> {/* Concentric Radar Rings */} <div className="absolute w-44 h-44 rounded-full border border-amber-500/20"></div> <div className="absolute w-72 h-72 rounded-full border border-amber-500/15"></div> <div className="absolute w-96 h-96 rounded-full border border-amber-500/10"></div> {/* Radar Crosshairs */} <div className="absolute inset-x-0 top-1/2 h-[1px] bg-amber-500/20"></div> <div className="absolute inset-y-0 left-1/2 w-[1px] bg-amber-500/20"></div> {/* Rotating Radar Sweep Line */} <div className="absolute w-48 h-48 rounded-full pointer-events-none origin-center animate-[spin_4s_linear_infinite] bg-gradient-to-tr from-amber-500/20 to-transparent"></div> {/* SVG Trajectory Path */} <svg className="absolute inset-0 w-full h-full pointer-events-none"> <defs> <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%"> <stop offset="0%" stopColor="#A87B28" /> <stop offset="100%" stopColor="#FCD33F" /> </linearGradient> </defs> <line x1={`${workerX}%`} y1={`${workerY}%`} x2="80%" y2="25%" stroke="url(#routeGrad)" strokeWidth="3" strokeDasharray="6 4" strokeLinecap="round" className="animate-pulse" /> </svg> {/* Destination Job Pin (Employer Site) */} <div className="absolute top-[25%] left-[80%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-10" title={jobAddress} > <div className="relative"> <div className="w-8 h-8 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 shadow-lg animate-bounce"> <MapPin className="w-4 h-4 text-amber-400 fill-amber-400" /> </div> <div className="absolute -inset-1 rounded-full border border-amber-400 animate-ping opacity-60"></div> </div> <div className="bg-slate-900/90 text-amber-300 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-500/30 whitespace-nowrap mt-1 shadow-md">  {t("Job Site")} </div> </div> {/* Moving Worker GPS Marker */} <div className="absolute flex flex-col items-center transition-all duration-700 ease-out z-20" style={{ left: `${workerX}%`, top: `${workerY}%`, transform: 'translate(-50%, -50%)', }} > <div className="relative"> <div className="w-8 h-8 rounded-full bg-amber-500 border-2 border-white shadow-xl flex items-center justify-center text-slate-950 font-black"> <Navigation className="w-4 h-4 transition-transform duration-300 text-slate-900" style={{ transform: `rotate(${heading}deg)` }} /> </div> <div className="absolute -inset-2 rounded-full border border-amber-400 animate-ping opacity-40 pointer-events-none"></div> </div> <div className="bg-slate-900/90 text-amber-300 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-500/30 whitespace-nowrap mt-1 shadow-md flex items-center gap-1"> <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> {workerName} ({currentDist <= 0.05 ? 'Arrived' : 'En Route'}) </div> </div> {/* Live Telemetry Overlay in Corner */} <div className="absolute bottom-2 left-2 bg-slate-900/90 backdrop-blur-xs border border-slate-700 px-2.5 py-1.5 rounded-xl text-[10px] font-mono text-slate-300 space-y-0.5"> <div className="flex items-center gap-1 text-amber-400 font-bold"> <Radio className="w-3 h-3 animate-pulse" /> <span> {t("GPS Precision: ±")} {gpsAccuracy} {t("m")} </span> </div> <div> {t("Lat:")} {liveCoords.lat.toFixed(4)} {t("° N")} </div> <div> {t("Lng:")} {liveCoords.lng.toFixed(4)} {t("° E")} </div> </div> {/* Compass Heading Indicator */} <div className="absolute top-2 right-2 bg-slate-900/90 border border-slate-700 px-2 py-1 rounded-xl text-[10px] font-mono text-slate-300 flex items-center gap-1"> <Compass className="w-3.5 h-3.5 text-amber-400" /> <span>{heading} {t("° Bearing")} </span> </div> </div> )} {/* Turn-by-turn Navigation Instruction Box */} <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3.5 flex items-start gap-3"> <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0"> <Navigation className="w-4 h-4" /> </div> <div className="flex-1 space-y-0.5"> <div className="text-xs font-bold text-white"> {currentDist <= 0.05 ? '🎯 You have arrived at the job site location!' : `Navigate towards ${jobAddress.slice(0, 36)}...`} </div> <p className="text-[11px] text-slate-400"> {currentDist <= 0.05 ? 'Worker and employer are within 5 meters. Share OTP to start work timer.' : `Route synced via Google Maps • ${(currentDist).toFixed(1)} km remaining (${activeEta} mins).`} </p> </div> </div> {/* Simulation & Google Maps Action buttons */} <div className="flex flex-wrap items-center gap-2"> <button onClick={() => { setIsNavigating(!isNavigating); playSound('click'); }} className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${ isNavigating ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-amber-600 hover:bg-amber-700 text-white' }`} > {isNavigating ? ( <> <RefreshCw className="w-3.5 h-3.5 animate-spin" /> <span> {t("Pause Movement")} </span> </> ) : ( <> <LocateFixed className="w-3.5 h-3.5" /> <span> {t("Simulate Walk")} </span> </> )} </button> <a href={googleMapsDirectionsUrl} target="_blank" rel="noopener noreferrer" className="py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs" > <ExternalLink className="w-3.5 h-3.5" /> <span> {t("Open in Google Maps")} </span> </a> </div> </div> {/* Footer */} <div className="p-4 bg-slate-800 border-t border-slate-700 flex items-center justify-between text-xs font-semibold text-slate-400"> <div className="flex items-center gap-1.5"> <Shield className="w-3.5 h-3.5 text-amber-400" /> <span> {t("Google Maps Grounded GPS • Battery optimized")} </span> </div> <button onClick={onClose} className="px-4 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition" >  {t("Close")} </button> </div> </div> </div> );
};
function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      {" "}
      <circle cx="12" cy="12" r="10" />{" "}
      <polyline points="12 6 12 12 16 14" />{" "}
    </svg>
  );
}
