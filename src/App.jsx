import React, { useEffect, useRef } from "react";
import { HashRouter, Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import "pannellum/build/pannellum.css";
import "pannellum/build/pannellum.js";

/**
 * Interactive Floor Map + 360 Viewer
 * -------------------------------------------------------------
 * Tech: React + Tailwind + React Router (HashRouter) + Pannellum
 * What you get:
 *  - A vector (SVG) floor map made of clickable boxes for each space
 *  - Each space links to its own page with a 360° equirectangular panorama
 *  - Clean, modern UI with a sidebar list and responsive layout
 *
 * How to use:
 * 1) Replace the SPACES[] data with your real room names, box positions/sizes, and panorama image URLs.
 *    - Each panorama should be an equirectangular image (2:1 ratio). JPG/PNG supported.
 * 2) Adjust the <svg viewBox> and rectangles to match your floor plan proportions.
 * 3) (Optional) Add hotspots or titles in the 360 viewer by extending the Pannellum config.
 */

// ---- SAMPLE DATA (Replace with your own) -----------------------------------
const SPACES = [
  {
    id: "speakers-theatre",
    name: "Speakers Theatre",
    x: 25,
    y: 20,
    w: 145,  // Pink area on the left
    h: 220,
    image: "/images/speakers_theatre.JPG",  // Updated filename
  },
  {
    id: "main-area",
    name: "Main Area",
    x: 170,  // Blue central area
    y: 20,
    w: 270,
    h: 220,
    image: "/images/main_area.JPG",  // Updated filename
  },
  {
    id: "students-testing",
    name: "Students Testing Area",
    x: 465,  // Purple area on the right
    y: -83,
    w: 115,
    h: 210,
    image: "/images/students_area.JPG",  // Updated filename
  },
  {
    id: "foyer",
    name: "Foyer",
    x: 25,  // Mint green area at bottom
    y: 240,
    w: 350,
    h: 135,
    image: "/images/foyer.JPG",  // Kept as is
  },
  {
    id: "entrance",
    name: "Entrance",
    x: 200,  // Bottom entrance area
    y: 375,
    w: 70,
    h: 120,
    image: "/images/entrance.JPG",  // Note: This image wasn't in your list
  }
];

// Utility to look up a space by ID
const getSpace = (id) => SPACES.find((s) => s.id === id);

// ---- 360° Viewer Component -------------------------------------------------
function PanoramaViewer({ src, title }) {
  const panoRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!panoRef.current) return;

    // Destroy any previous instance
    if (viewerRef.current && viewerRef.current.destroy) {
      try { viewerRef.current.destroy(); } catch {}
      viewerRef.current = null;
    }

    // Initialize Pannellum from the global object
    viewerRef.current = window.pannellum.viewer(panoRef.current, {
      type: "equirectangular",
      panorama: src,
      autoLoad: true,
      autoRotate: 0,
      showControls: true,
      compass: false,
      hfov: 100,
      minHfov: 60,
      maxHfov: 120,
      preview: undefined,
    });

    const handleResize = () => {
      try { viewerRef.current && viewerRef.current.resize(); } catch {}
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (viewerRef.current && viewerRef.current.destroy) {
        try { viewerRef.current.destroy(); } catch {}
      }
    };
  }, [src]);

  return (
    <div className="w-full h-[60vh] md:h-[70vh] rounded-2xl overflow-hidden shadow-lg border border-gray-200">
      <div ref={panoRef} className="w-full h-full" aria-label={`${title} 360 Viewer`} />
    </div>
  );
}

// ---- Floor Map (SVG) -------------------------------------------------------
function FloorMap() {
  return (
    <div className="relative w-full rounded-2xl shadow-md overflow-hidden">
      <img 
        src="/images/Graphic-Floorplan.jpg" 
        alt="Floor Plan"
        className="w-full h-auto"
      />
      
      <svg 
        viewBox="0 0 640 400" 
        className="absolute top-0 left-0 w-full h-full"
      >
        {SPACES.map((space) => (
          <Link key={space.id} to={`/space/${space.id}`}>
            <rect
              x={space.x}
              y={space.y}
              width={space.w}
              height={space.h}
              style={{
                fill: 'rgba(255, 255, 255, 0)',
                stroke: 'white',
                strokeWidth: 1,
                cursor: 'pointer',
                transition: 'fill 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.fill = 'rgba(255, 255, 255, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.fill = 'rgba(255, 255, 255, 0)';
              }}
            />
          </Link>
        ))}
      </svg>
    </div>
  );
}

// ---- Pages -----------------------------------------------------------------
function Home() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2">
        <FloorMap />
      </div>
      <div className="md:col-span-1">
        <div className="bg-[#c5fff9] rounded-2xl shadow-lg p-4 border border-gray-200 h-full">
          <h3 className="text-2xl mb-2" style={{ fontFamily: 'Porkys', color: '#2e3192' }}>Spaces</h3>
          <p className="text-sm text-gray-500 mb-3">Click on the area you wish to view on the map or choose from the list:</p>
          <ul className="space-y-2">
            {SPACES.map((s) => (
              <li key={s.id}>
                <Link
                  to={`/space/${s.id}`}
                  className="block px-3 py-2 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 bg-white"
                >
                  <div style={{ fontFamily: 'Porkys', color: '#2e3192' }} className="font-medium text-lg">{s.name}</div>
                  <div className="text-xs text-gray-500">Open 360° view</div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function SpacePage() {
  const { id } = useParams();
  const space = getSpace(id);
  const navigate = useNavigate();

  useEffect(() => {
    if (!space) {
      // If route id is invalid, bounce to home after a beat
      const t = setTimeout(() => navigate("/", { replace: true }), 1200);
      return () => clearTimeout(t);
    }
  }, [space, navigate]);

  if (!space) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 text-center">
        <p className="text-gray-700">That space doesn't exist. Redirecting…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-2 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        >
          ← Back
        </button>
        <h1 className="text-4xl" style={{ fontFamily: 'Porkys', color: '#2e3192' }}>{space.name}</h1>
      </div>
      <PanoramaViewer src={space.image} title={space.name} />
      <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-200">
        <h3 className="font-semibold mb-2">About this space</h3>
        <p className="text-gray-600 text-sm">
          Replace this section with details (capacity, amenities, booking rules, etc.).
        </p>
      </div>
    </div>
  );
}

function Layout({ children }) {
  return (
    <div 
      className="min-h-screen w-full"
      style={{ backgroundColor: '#cfd3ff' }}
    >
      {/* Move header outside the max-width container */}
      <header className="sticky top-0 z-30 w-full backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white border-b border-gray-200">
        {/* Add max-width container inside header */}
        <div className="mx-auto max-w-7xl">
          <div className="px-4 py-3 flex items-center justify-between">
            <Link 
              to="/" 
              className="text-3xl" 
              style={{ fontFamily: 'Porkys', color: '#2e3192' }}
            >
              PlayThisIGF Interactive Floorplan
            </Link>
            <nav className="text-sm text-gray-600 flex gap-4">
              <Link to="/" className="hover:text-indigo-600">Map</Link>
              <a href="#how-to" className="hover:text-indigo-600">How to use</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Content container */}
      <div className="min-h-screen mx-auto max-w-7xl px-4">
        <main className="py-6">
          {children}
        </main>

        <footer className="py-8 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Building Explorer
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/space/:id" element={<SpacePage />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
