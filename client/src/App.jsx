import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Admin from './Admin';
import logo from './static/logo.png';

import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Menu,
  MessageCircle,
  Facebook,
  Handshake,
  Instagram,
  Linkedin,
  MapPin,
  Pill,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Wheat,
  X
} from 'lucide-react';

// Logo image style (so no extra CSS is needed)
const brandImgStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  display: 'block'
};

// Product illustration fallback
function ProductArt({ index = 0 }) {
  return (
    <div
      className={`product-art art-${index % 4}`}
      aria-hidden="true"
    >
      <div className="art-orbit orbit-one" />
      <div className="art-orbit orbit-two" />
      <div className="art-cross">＋</div>
      <div className="art-pill">
        <span />
        <span />
        <span />
      </div>
      <div className="art-caption">BOS IND</div>
    </div>
  );
}

// Get all available product images.
// Supports both new image_urls and older image_url records.
function getProductImages(product) {
  const multipleImages = Array.isArray(product?.image_urls)
    ? product.image_urls.filter(Boolean)
    : [];

  const singleImage = product?.image_url
    ? [product.image_url]
    : [];

  return [...new Set([...multipleImages, ...singleImage])];
}

// Product image with automatic fallback
function ProductImage({ product, index = 0 }) {
  const [imageFailed, setImageFailed] = useState(false);

  const imageUrl = getProductImages(product)[0];

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  if (!imageUrl || imageFailed) {
    return <ProductArt index={index} />;
  }

  return (
    <img
      src={imageUrl}
      alt={product?.name || 'Bos Inducs product'}
      loading="lazy"
      onError={() => setImageFailed(true)}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        display: 'block'
      }}
    />
  );
}

// Multiple image gallery for product details

function ProductGallery({ product }) {
  const images = getProductImages(product);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    setActiveImageIndex(0);
    setImageFailed(false);
    setLightboxOpen(false);
  }, [product?.id, product?._id]);

  const safeIndex =
    activeImageIndex < images.length ? activeImageIndex : 0;

  const activeImage = images[safeIndex];

  function selectImage(index) {
    setActiveImageIndex(index);
    setImageFailed(false);
  }

  function previousImage() {
    setActiveImageIndex(current =>
      (current - 1 + images.length) % images.length
    );
  }

  function nextImage() {
    setActiveImageIndex(current =>
      (current + 1) % images.length
    );
  }

  // Keyboard controls for full-screen preview
  useEffect(() => {
    if (!lightboxOpen) return;

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
      }

      if (e.key === 'ArrowLeft' && images.length > 1) {
        previousImage();
      }

      if (e.key === 'ArrowRight' && images.length > 1) {
        nextImage();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [lightboxOpen, images.length]);

  return (
    <div className="product-gallery">

      {/* Main product image */}
      <div
        className="product-gallery-main"
        style={{
          background: '#edf3eb',
          borderRadius: 20,
          height: 350,
          minHeight: 280,
          display: 'grid',
          placeItems: 'center',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {activeImage && !imageFailed ? (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            aria-label="View product image in full screen"
            style={{
              width: '100%',
              height: '100%',
              padding: 0,
              border: 'none',
              background: 'transparent',
              cursor: 'zoom-in'
            }}
          >
            <img
              key={activeImage}
              src={activeImage}
              alt={`${product.name} - Image ${safeIndex + 1}`}
              onError={() => setImageFailed(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </button>
        ) : (
          <ProductArt index={0} />
        )}

        {/* Image count */}
        {images.length > 1 && (
          <span
            style={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              background: 'rgba(0,0,0,0.68)',
              color: '#fff',
              padding: '7px 12px',
              borderRadius: 30,
              fontSize: 12,
              fontWeight: 600,
              pointerEvents: 'none'
            }}
          >
            {safeIndex + 1} / {images.length}
          </span>
        )}

        {/* Zoom hint */}
        {activeImage && !imageFailed && (
          <span
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'rgba(0,0,0,0.65)',
              color: '#fff',
              padding: '7px 11px',
              borderRadius: 20,
              fontSize: 12,
              pointerEvents: 'none'
            }}
          >
            Click to enlarge ↗
          </span>
        )}
      </div>

      {/* Image thumbnails */}
      {images.length > 1 && (
        <div
          className="product-gallery-thumbnails"
          style={{
            display: 'flex',
            gap: 12,
            marginTop: 14,
            overflowX: 'auto',
            paddingBottom: 8
          }}
        >
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => selectImage(index)}
              aria-label={`Show product image ${index + 1}`}
              aria-pressed={safeIndex === index}
              style={{
                flex: '0 0 76px',
                width: 76,
                height: 76,
                padding: 3,
                borderRadius: 10,
                overflow: 'hidden',
                cursor: 'pointer',
                background: '#edf3eb',
                border:
                  safeIndex === index
                    ? '2px solid #91b64b'
                    : '2px solid #dce5d9'
              }}
            >
              <img
                src={image}
                alt={`${product.name} thumbnail ${index + 1}`}
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block',
                  borderRadius: 6
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Full-screen image preview */}
      {lightboxOpen && activeImage && (
        <div
          onClick={() => setLightboxOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0,0,0,0.94)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close image preview"
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: '1px solid #666',
              background: '#222',
              color: '#fff',
              fontSize: 27,
              cursor: 'pointer',
              zIndex: 2
            }}
          >
            ×
          </button>

          {/* Product image */}
          <img
            src={activeImage}
            alt={`${product.name} - Full screen image`}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '90%',
              maxHeight: '85vh',
              objectFit: 'contain',
              borderRadius: 8
            }}
          />

          {/* Previous button */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                previousImage();
              }}
              aria-label="Previous image"
              style={{
                position: 'absolute',
                left: 15,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 46,
                height: 46,
                borderRadius: '50%',
                border: '1px solid #777',
                background: '#222',
                color: '#fff',
                fontSize: 27,
                cursor: 'pointer'
              }}
            >
              ‹
            </button>
          )}

          {/* Next button */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                nextImage();
              }}
              aria-label="Next image"
              style={{
                position: 'absolute',
                right: 15,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 46,
                height: 46,
                borderRadius: '50%',
                border: '1px solid #777',
                background: '#222',
                color: '#fff',
                fontSize: 27,
                cursor: 'pointer'
              }}
            >
              ›
            </button>
          )}

          {/* Image counter */}
          <div
            style={{
              position: 'absolute',
              bottom: 22,
              color: '#fff',
              fontSize: 14
            }}
          >
            {safeIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
}


// WhatsApp message helper
function getWhatsAppLink(number, productName) {
  const message = `Hello Bos Inducs Pharmaceuticals, I would like to enquire about ${productName}. Please share the product details and availability.`;

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

// Individual product details page
function ProductDetails({
  productId,
  products,
  loading,
  whatsappNumber
}) {
  const product = products.find(
    item => String(item._id || item.id) === String(productId)
  );

  if (loading) {
    return (
      <main className="section" style={{ minHeight: '70vh' }}>
        <p>Loading product details...</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="section" style={{ minHeight: '70vh' }}>
        <h2>Product not found</h2>
        <p>
          This product may have been removed or is currently unavailable.
        </p>
        <a href="/#products" className="under-link">
          ← Back to products
        </a>
      </main>
    );
  }

  return (
    <>
      <div className="announcement">
        <span className="announcement-dot" />
        Animal health. Thoughtful partnerships.
        <a href="/#contact">
          Connect with our team <ArrowUpRight size={13} />
        </a>
      </div>

      <SiteHeader base="/" />

      <main
        className="section"
        style={{
          minHeight: '70vh',
          paddingTop: 60,
          paddingBottom: 80
        }}
      >
        <a href="/#products" className="under-link">
          ← Back to products
        </a>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: 45,
            alignItems: 'start',
            marginTop: 35
          }}
        >
          {/* Product image gallery */}
          <ProductGallery product={product} />

          {/* Product information */}
          <div>
            <div className="section-kicker">
              {product.category || 'PRODUCT DETAILS'}
            </div>

            <h1
              style={{
                fontSize: 'clamp(30px, 5vw, 48px)',
                margin: '18px 0'
              }}
            >
              {product.name}
            </h1>

            {product.price !== null &&
              product.price !== undefined &&
              product.price !== '' && (
                <h2>₹{product.price}</h2>
              )}

            <p style={{ lineHeight: 1.8, color: '#68766d' }}>
              {product.description ||
                'Contact our team for product information and availability.'}
            </p>

            <div
              style={{
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
                marginTop: 28
              }}
            >
              <a className="btn btn-lime" href="/#contact">
                Send an enquiry <ArrowUpRight size={16} />
              </a>

              {whatsappNumber && (
                <a
                  className="btn btn-lime"
                  href={getWhatsAppLink(whatsappNumber, product.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={16} /> WhatsApp us
                </a>
              )}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter base="/" whatsappNumber={whatsappNumber} />
    </>
  );
}

// ---------------------------------------------------------------
// Hero slider
// Put your photos in:  src/static/hero/  (hero1.jpg, hero2.jpg ...)
// Any .jpg / .jpeg / .png / .webp / .avif there is picked up
// automatically, in file-name order. With no photos the slider
// still works and shows animated green pasture scenes instead.
// ---------------------------------------------------------------
const heroImages = Object.entries(
  import.meta.glob('./static/hero/*.{jpg,jpeg,png,webp,avif}', {
    eager: true,
    import: 'default'
  })
)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, url]) => url);

const SLIDE_MS = 3000;

const HERO_SLIDES = [
  {
    kicker: 'ANIMAL HEALTH & NUTRITION',
    line1: 'Better care.',
    em: 'Healthier',
    line2: 'herds.',
    text:
      'Connecting animal-care professionals with veterinary and animal nutrition products — with a focus on dependable service and long-term relationships.'
  },
  {
    kicker: 'RICH NUTRITION',
    line1: 'Quality feed.',
    em: 'Stronger',
    line2: 'animals.',
    text:
      'Feed supplements and nutrition support to help your cattle stay active, productive and in good condition every day.'
  },
  {
    kicker: 'CARING HANDS',
    line1: 'Trusted by farmers.',
    em: 'Thriving',
    line2: 'farms.',
    text:
      'Good animal care starts with people who look after their herds. We are here to support them with the right products and honest guidance.'
  },
  {
    kicker: 'FROM PASTURE TO PERFORMANCE',
    line1: 'Green fields.',
    em: 'Happy',
    line2: 'cattle.',
    text:
      'Healthy animals, balanced nutrition and long-term partnerships — the foundation of every successful dairy and livestock business.'
  }
];

const HERO_CSS = `
.hs-hero{position:relative;overflow:hidden;min-height:min(92vh,780px);background:#0d2318;color:#fff;isolation:isolate}
.hs-slide{position:absolute;inset:0;opacity:0;visibility:hidden;transition:opacity 1.2s ease,visibility 0s linear 1.2s;z-index:0}
.hs-slide.active{opacity:1;visibility:visible;transition:opacity 1.2s ease;z-index:1}
.hs-bg{position:absolute;inset:0;background-size:cover;background-position:center;transform:scale(1.02)}
.hs-slide.active .hs-bg{animation:hsKen 9s ease-out forwards}
@keyframes hsKen{from{transform:scale(1.02)}to{transform:scale(1.14)}}
.hs-slide:nth-child(even).active .hs-bg{animation-name:hsKenB}
@keyframes hsKenB{from{transform:scale(1.14)}to{transform:scale(1.02)}}

/* Fallback scenes (used when no photos are added) */
.hs-f0{background:radial-gradient(ellipse at 75% 20%,#f6e7a8 0,#d9c96a 8%,transparent 32%),linear-gradient(180deg,#2b5a3a 0,#1a4029 55%,#0d2318 100%)}
.hs-f1{background:radial-gradient(ellipse at 20% 25%,#cfe58a 0,transparent 40%),linear-gradient(160deg,#3d7a3f 0,#1f4d2c 60%,#0d2318 100%)}
.hs-f2{background:radial-gradient(ellipse at 80% 30%,#ffd9a0 0,transparent 38%),linear-gradient(170deg,#4a6b35 0,#243f24 60%,#0d2318 100%)}
.hs-f3{background:radial-gradient(ellipse at 50% 15%,#bfe3ff 0,transparent 45%),linear-gradient(180deg,#3f8a4a 0,#1d5230 60%,#0d2318 100%)}

.hs-overlay{position:absolute;inset:0;z-index:2;background:linear-gradient(90deg,rgba(8,26,16,.88) 0,rgba(8,26,16,.62) 45%,rgba(8,26,16,.18) 100%),linear-gradient(0deg,rgba(8,26,16,.75) 0,transparent 40%)}

.hs-content{position:relative;z-index:5;max-width:1240px;margin:0 auto;padding:clamp(70px,12vh,130px) clamp(20px,5vw,56px) 170px;min-height:inherit;display:flex;flex-direction:column;justify-content:center}
.hs-text{position:absolute;left:0;right:0;top:50%;transform:translateY(-58%);padding:0 clamp(20px,5vw,56px);max-width:1240px;margin:0 auto;pointer-events:none}
.hs-text-inner{max-width:640px;pointer-events:auto}
.hs-kicker{display:inline-flex;align-items:center;gap:10px;font-size:12px;letter-spacing:.2em;font-weight:600;color:#c8e68a}
.hs-kicker i{display:block;width:34px;height:2px;background:#91b64b}
.hs-title{font-size:clamp(38px,6.4vw,78px);line-height:1.02;margin:18px 0 20px;font-weight:700;letter-spacing:-.02em}
.hs-title em{font-style:italic;color:#b7e04f}
.hs-lead{font-size:clamp(15px,1.5vw,18px);line-height:1.75;color:rgba(255,255,255,.84);max-width:560px;margin:0 0 30px}
.hs-actions{display:flex;gap:22px;flex-wrap:wrap;align-items:center}

.hs-anim{opacity:0;transform:translateY(34px)}
.hs-slide.active .hs-anim{animation:hsUp .9s cubic-bezier(.2,.7,.2,1) forwards}
.hs-slide.active .d1{animation-delay:.25s}
.hs-slide.active .d2{animation-delay:.45s}
.hs-slide.active .d3{animation-delay:.65s}
.hs-slide.active .d4{animation-delay:.85s}
@keyframes hsUp{to{opacity:1;transform:none}}

.hs-chips{position:absolute;right:clamp(20px,5vw,56px);bottom:170px;z-index:6;display:flex;flex-direction:column;gap:14px}
.hs-chip{display:flex;gap:12px;align-items:center;padding:12px 18px;border-radius:16px;background:rgba(255,255,255,.12);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.22);animation:hsFloat 5s ease-in-out infinite}
.hs-chip:nth-child(2){animation-delay:-2.5s}
.hs-chip b{display:block;font-size:14px}
.hs-chip small{display:block;font-size:12px;opacity:.78}
.hs-chip-ic{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#91b64b;color:#0d2318;flex:none}
@keyframes hsFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}

.hs-grass{position:absolute;left:0;bottom:0;width:100%;height:120px;z-index:4;pointer-events:none;overflow:hidden}
.hs-grass svg{position:absolute;bottom:-2px;left:0;width:200%;height:100%;animation:hsSway 14s linear infinite}
.hs-grass svg.b{opacity:.55;height:80%;animation-duration:22s;animation-direction:reverse}
@keyframes hsSway{to{transform:translateX(-50%)}}

.hs-controls{position:absolute;z-index:7;left:0;right:0;bottom:46px;max-width:1240px;margin:0 auto;padding:0 clamp(20px,5vw,56px);display:flex;align-items:center;gap:18px}
.hs-arrow{width:46px;height:46px;border-radius:50%;border:1px solid rgba(255,255,255,.4);background:rgba(255,255,255,.1);color:#fff;font-size:22px;cursor:pointer;backdrop-filter:blur(6px);transition:.25s}
.hs-arrow:hover{background:#91b64b;color:#0d2318;border-color:#91b64b}
.hs-dots{display:flex;gap:10px;align-items:center}
.hs-dot{position:relative;width:46px;height:4px;border:none;padding:0;border-radius:4px;background:rgba(255,255,255,.3);cursor:pointer;overflow:hidden}
.hs-dot.active::after{content:"";position:absolute;inset:0;background:#b7e04f;transform-origin:left;animation:hsBar var(--ms) linear forwards}
.hs-dot.done::after{content:"";position:absolute;inset:0;background:#b7e04f}
.hs-paused .hs-dot.active::after{animation-play-state:paused}
@keyframes hsBar{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.hs-count{margin-left:auto;font-size:13px;letter-spacing:.18em;opacity:.85}
.hs-loc{position:absolute;z-index:6;left:clamp(20px,5vw,56px);bottom:104px;font-size:11px;letter-spacing:.2em;opacity:.75;display:flex;align-items:center;gap:10px}
.hs-loc i{display:block;width:28px;height:1px;background:#fff}

@media (max-width:820px){
  .hs-chips{display:none}
  .hs-overlay{background:linear-gradient(0deg,rgba(8,26,16,.9) 0,rgba(8,26,16,.55) 60%,rgba(8,26,16,.4) 100%)}
  .hs-hero{min-height:640px}
  .hs-text{top:46%}
  .hs-count{display:none}
  .hs-dot{width:30px}
  .hs-loc{display:none}
}
@media (prefers-reduced-motion:reduce){
  .hs-slide.active .hs-bg,.hs-chip,.hs-grass svg{animation:none}
  .hs-slide.active .hs-anim{animation-duration:.01s;animation-delay:0s}
}
/* --- Faster slides + stronger text legibility --- */
.hs-slide{transition:opacity .8s ease,visibility 0s linear .8s}
.hs-slide.active{transition:opacity .8s ease}
.hs-slide.active .hs-bg{animation-duration:4.5s}
.hs-slide.active .hs-anim{animation-duration:.6s}
.hs-slide.active .d1{animation-delay:.05s}
.hs-slide.active .d2{animation-delay:.15s}
.hs-slide.active .d3{animation-delay:.25s}
.hs-slide.active .d4{animation-delay:.35s}
.hs-overlay{background:linear-gradient(90deg,rgba(5,18,11,.94) 0,rgba(5,18,11,.78) 48%,rgba(5,18,11,.35) 100%),linear-gradient(0deg,rgba(5,18,11,.85) 0,transparent 45%)}
.hs-text-inner{max-width:680px;padding:clamp(22px,3vw,40px);border-radius:28px;background:rgba(5,18,11,.5);border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);box-shadow:0 30px 60px -30px rgba(0,0,0,.7)}
.hs-kicker{padding:7px 16px;border-radius:999px;background:rgba(183,224,79,.16);border:1px solid rgba(183,224,79,.5);color:#d6f28a;font-weight:700}
.hs-title{color:#fff;font-weight:800;text-shadow:0 4px 24px rgba(0,0,0,.65)}
.hs-title em{color:#c6ee55}
.hs-lead{color:#fff;font-weight:500;text-shadow:0 2px 12px rgba(0,0,0,.7)}
.hs-text-inner .btn{font-weight:700}
.hs-text-inner .light-link{color:#fff;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,.6)}
@media (max-width:820px){
  .hs-hero{min-height:760px}
  .hs-text{top:44%}
  .hs-text-inner{padding:22px 20px;border-radius:22px;background:rgba(5,18,11,.6)}
  .hs-title{font-size:clamp(34px,10vw,48px)}
}
`;

function HeroSlider() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(null);
  const total = HERO_SLIDES.length;

  const goTo = index => setActive((index + total) % total);

  // Auto-advance
  useEffect(() => {
    if (paused) return undefined;

    const timer = setTimeout(() => {
      setActive(current => (current + 1) % total);
    }, SLIDE_MS);

    return () => clearTimeout(timer);
  }, [active, paused, total]);

  function onTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e) {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(diff) > 50) {
      goTo(diff < 0 ? active + 1 : active - 1);
    }
  }

  return (
    <section
      className={paused ? 'hs-hero hs-paused' : 'hs-hero'}
      id="home"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
      aria-label="Bos Inducs highlights"
    >
      <style>{HERO_CSS}</style>

      {HERO_SLIDES.map((slide, index) => {
        const image = heroImages.length
          ? heroImages[index % heroImages.length]
          : null;

        return (
          <div
            key={slide.kicker}
            className={index === active ? 'hs-slide active' : 'hs-slide'}
            aria-hidden={index !== active}
          >
            <div
              className={image ? 'hs-bg' : `hs-bg hs-f${index % 4}`}
              style={image ? { backgroundImage: `url(${image})` } : undefined}
            />
            <div className="hs-overlay" />

            <div className="hs-text">
              <div className="hs-text-inner">
                <div className="hs-kicker hs-anim d1">
                  <i /> {slide.kicker}
                </div>

                <h1 className="hs-title hs-anim d2">
                  {slide.line1}
                  <br />
                  <em>{slide.em}</em> {slide.line2}
                </h1>

                <p className="hs-lead hs-anim d3">{slide.text}</p>

                <div className="hs-actions hs-anim d4">
                  <a className="btn btn-lime" href="#products">
                    Explore products <ArrowRight size={17} />
                  </a>

                  <a className="text-link light-link" href="#about">
                    Discover our company <ArrowDown size={15} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Floating info chips */}
      <div className="hs-chips">
        <div className="hs-chip">
          <span className="hs-chip-ic"><ShieldCheck size={17} /></span>
          <span>
            <b>Quality-minded</b>
            <small>Product-focused approach</small>
          </span>
        </div>

        <div className="hs-chip">
          <span className="hs-chip-ic"><Sparkles size={17} /></span>
          <span>
            <b>People-first service</b>
            <small>Built around your enquiry</small>
          </span>
        </div>
      </div>

      <div className="hs-loc">
        <i /> BASED IN AGRA, UTTAR PRADESH, INDIA
      </div>

      {/* Animated grass waves */}
      <div className="hs-grass" aria-hidden="true">
        <svg className="b" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path
            fill="#2f6b3a"
            d="M0 70 C120 20 240 110 360 60 C480 10 600 110 720 70 C840 20 960 110 1080 60 C1200 10 1320 110 1440 70 L1440 120 L0 120Z"
          />
        </svg>
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path
            fill="#0d2318"
            d="M0 85 C120 55 240 115 360 85 C480 55 600 115 720 85 C840 55 960 115 1080 85 C1200 55 1320 115 1440 85 L1440 120 L0 120Z"
          />
        </svg>
      </div>

      {/* Controls */}
      <div className="hs-controls">
        <button
          type="button"
          className="hs-arrow"
          onClick={() => goTo(active - 1)}
          aria-label="Previous slide"
        >
          ‹
        </button>

        <div className="hs-dots" style={{ '--ms': `${SLIDE_MS}ms` }}>
          {HERO_SLIDES.map((slide, index) => (
            <button
              key={slide.kicker}
              type="button"
              className={
                index === active
                  ? 'hs-dot active'
                  : index < active
                    ? 'hs-dot done'
                    : 'hs-dot'
              }
              onClick={() => goTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          className="hs-arrow"
          onClick={() => goTo(active + 1)}
          aria-label="Next slide"
        >
          ›
        </button>

        <span className="hs-count">
          {String(active + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------
// Founder / CEO details  ->  EDIT THESE
// Put the CEO photo in:  src/static/ceo/  (e.g. ceo.jpg)
// ---------------------------------------------------------------
const FOUNDER = {
  name: 'Naval Kishor Chahar',
  title: 'Founder & CEO'
};

const ceoPhoto =
  Object.entries(
    import.meta.glob('./static/ceo/*.{jpg,jpeg,png,webp,avif}', {
      eager: true,
      import: 'default'
    })
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, url]) => url)[0] || null;

// Reveal-on-scroll helper used by the About and Approach sections
function useReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;

    const items = root.querySelectorAll('.rv');

    if (!('IntersectionObserver' in window)) {
      items.forEach(item => item.classList.add('in'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    items.forEach(item => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return ref;
}

const ABOUT_CSS = `
.ab{position:relative;overflow:hidden;background:#f5f8f1;color:#17261c;padding:clamp(70px,9vw,120px) clamp(20px,5vw,56px)}
.ab::before{content:"";position:absolute;width:520px;height:520px;right:-180px;top:-160px;border-radius:50%;background:radial-gradient(circle,rgba(145,182,75,.22),transparent 70%);pointer-events:none}
.ab::after{content:"";position:absolute;width:420px;height:420px;left:-160px;bottom:-140px;border-radius:50%;background:radial-gradient(circle,rgba(31,77,44,.12),transparent 70%);pointer-events:none}
.ab-inner{position:relative;z-index:1;max-width:1240px;margin:0 auto}
.ab-kicker{display:inline-flex;align-items:center;gap:12px;font-size:12px;font-weight:700;letter-spacing:.2em;color:#4f7a1d}
.ab-kicker i{display:block;width:36px;height:2px;background:#91b64b}
.ab-title{font-size:clamp(32px,4.8vw,58px);line-height:1.06;letter-spacing:-.02em;font-weight:700;color:#0f2a1c;margin:16px 0 0;max-width:860px}
.ab-title em{font-style:italic;color:#5f8a1f}
.ab-grid{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(36px,6vw,80px);margin-top:clamp(40px,5vw,64px);align-items:start}

.ab-photo-wrap{position:relative;padding:0 18px 18px 0}
.ab-photo-wrap::before{content:"";position:absolute;inset:18px 0 0 18px;border:2px solid #91b64b;border-radius:30px}
.ab-photo{position:relative;border-radius:28px;overflow:hidden;aspect-ratio:4/5;background:linear-gradient(160deg,#2f6b3a,#0d2318);box-shadow:0 30px 60px -25px rgba(13,35,24,.55)}
.ab-photo img.ab-ceo{width:100%;height:100%;object-fit:cover;object-position:top center;display:block;transition:transform 1.2s ease}
.ab-photo:hover img.ab-ceo{transform:scale(1.04)}
.ab-photo-fallback{position:absolute;inset:0;display:grid;place-items:center}
.ab-photo-fallback img{width:62%;max-width:260px;opacity:.95}
.ab-photo-fallback small{position:absolute;top:18px;left:0;right:0;text-align:center;color:rgba(255,255,255,.7);font-size:12px;letter-spacing:.12em}
.ab-plate{position:absolute;left:14px;right:14px;bottom:14px;padding:16px 18px;border-radius:18px;background:rgba(13,35,24,.78);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);color:#fff}
.ab-plate b{display:block;font-size:18px}
.ab-plate span{display:block;font-size:13px;color:#c8e68a;margin-top:3px;letter-spacing:.04em}
.ab-badge{position:absolute;top:-14px;right:-4px;z-index:3;width:104px;height:104px;border-radius:50%;background:#91b64b;color:#0d2318;display:grid;place-items:center;text-align:center;box-shadow:0 14px 30px -10px rgba(13,35,24,.5);animation:abFloat 5s ease-in-out infinite}
.ab-badge small{display:block;font-size:10px;letter-spacing:.18em;font-weight:700}
.ab-badge b{display:block;font-size:30px;line-height:1}
@keyframes abFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}

.ab-story p{font-size:16.5px;line-height:1.85;color:#34453a;margin:0 0 18px}
.ab-story p.lead{font-size:clamp(19px,2vw,23px);line-height:1.6;color:#0f2a1c;font-weight:500}
.ab-story p.lead strong{color:#4f7a1d}
.ab-line{margin:26px 0 8px;padding:6px 0 6px 20px;border-left:4px solid #91b64b;font-size:clamp(18px,1.9vw,22px);font-style:italic;color:#1f4d2c;line-height:1.5}

.ab-sub{display:flex;align-items:center;gap:14px;margin:38px 0 18px;font-size:13px;font-weight:700;letter-spacing:.16em;color:#0f2a1c}
.ab-sub::after{content:"";flex:1;height:1px;background:#cfdccb}
.ab-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.ab-card{background:#fff;border:1px solid #dce7d6;border-radius:20px;padding:22px;transition:transform .35s ease,box-shadow .35s ease,border-color .35s ease}
.ab-card:hover{transform:translateY(-6px);box-shadow:0 22px 40px -22px rgba(13,35,24,.4);border-color:#91b64b}
.ab-ic{width:46px;height:46px;border-radius:14px;display:grid;place-items:center;background:#e8f2d8;color:#2f6b3a;margin-bottom:14px}
.ab-card h4{margin:0 0 6px;font-size:16.5px;color:#0f2a1c}
.ab-card p{margin:0;font-size:14.5px;line-height:1.7;color:#4a5b50}

.ab-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin-top:clamp(44px,5vw,70px);background:#0f2a1c;border-radius:24px;overflow:hidden}
.ab-stat{padding:26px 24px;color:#fff;border-right:1px solid rgba(255,255,255,.12)}
.ab-stat:last-child{border-right:none}
.ab-stat b{display:block;font-size:clamp(28px,3.4vw,42px);color:#b7e04f;line-height:1.1}
.ab-stat span{display:block;margin-top:6px;font-size:13px;color:rgba(255,255,255,.8);letter-spacing:.04em}

.ab-actions{display:flex;flex-wrap:wrap;gap:16px;align-items:center;margin-top:34px}
.ab-btn{display:inline-flex;align-items:center;gap:8px;padding:14px 26px;border-radius:999px;background:#0f2a1c;color:#fff;font-weight:600;font-size:15px;text-decoration:none;transition:.3s}
.ab-btn:hover{background:#91b64b;color:#0d2318;transform:translateY(-2px)}
.ab-btn.alt{background:transparent;color:#0f2a1c;border:1.5px solid #0f2a1c}
.ab-btn.alt:hover{background:#0f2a1c;color:#fff}

.rv{opacity:0;transform:translateY(30px);transition:opacity .85s ease,transform .85s cubic-bezier(.2,.7,.2,1);transition-delay:var(--d,0s)}
.rv.in{opacity:1;transform:none}

@media (max-width:900px){
  .ab-grid{grid-template-columns:1fr}
  .ab-photo-wrap{max-width:440px;margin:0 auto;width:100%}
}
@media (max-width:620px){
  .ab-cards{grid-template-columns:1fr}
  .ab-stats{grid-template-columns:1fr}
  .ab-stat{border-right:none;border-bottom:1px solid rgba(255,255,255,.12)}
  .ab-stat:last-child{border-bottom:none}
}
@media (prefers-reduced-motion:reduce){
  .rv{opacity:1;transform:none;transition:none}
  .ab-badge{animation:none}
}
`;

function AboutSection() {
  const ref = useReveal();

  const professionalCards = [
    {
      icon: <Stethoscope size={22} />,
      title: 'Clear product information',
      text:
        'Product details, pack information and availability shared clearly on request, so you can choose with confidence for your patients.'
    },
    {
      icon: <Pill size={22} />,
      title: 'Veterinary & nutrition range',
      text:
        'Veterinary products alongside animal feed supplements, supporting both day-to-day nutrition and animal care.'
    },
    {
      icon: <Wheat size={22} />,
      title: 'Grounded in field reality',
      text:
        'We understand the conditions animals live in at village level, which keeps our conversations practical, not theoretical.'
    },
    {
      icon: <Handshake size={22} />,
      title: 'Direct access to our team',
      text:
        'Reach real people through the enquiry form or WhatsApp, and get a personal response to your questions.'
    }
  ];

  return (
    <section className="ab" id="about" ref={ref}>
      <style>{ABOUT_CSS}</style>

      <div className="ab-inner">
        <div className="ab-kicker rv"><i /> 01 / WHO WE ARE</div>

        <h2 className="ab-title rv" style={{ '--d': '.08s' }}>
          Born in the village. Built for the people who <em>heal animals.</em>
        </h2>

        <div className="ab-grid">
          {/* Founder photo */}
          <div className="ab-photo-wrap rv" style={{ '--d': '.15s' }}>
            <div className="ab-badge">
              <span>
                <small>ESTABLISHED</small>
                <b>2022</b>
              </span>
            </div>

            <div className="ab-photo">
              {ceoPhoto ? (
                <img
                  className="ab-ceo"
                  src={ceoPhoto}
                  alt={`${FOUNDER.name}, ${FOUNDER.title} of Bos Inducs Pharmaceuticals`}
                />
              ) : (
                <div className="ab-photo-fallback">
                  <small>ADD CEO PHOTO IN src/static/ceo/</small>
                  <img src={logo} alt="Bos Inducs Pharmaceuticals" />
                </div>
              )}

              <div className="ab-plate">
                <b>{FOUNDER.name}</b>
                <span>{FOUNDER.title} · Bos Inducs Pharmaceuticals</span>
              </div>
            </div>
          </div>

          {/* Story */}
          <div>
            <div className="ab-story">
              <p className="lead rv" style={{ '--d': '.1s' }}>
                Bos Inducs Pharmaceuticals was founded in <strong>2022</strong> in
                Agra, with a simple belief: the people who care for animals
                deserve products and guidance they can truly rely on.
              </p>

              <p className="rv" style={{ '--d': '.18s' }}>
                Our founder grew up in a village, where a cow or a buffalo is
                never just livestock. It is the family's income, its daily milk
                and its security. When an animal falls ill or underperforms, the
                whole household feels it. That upbringing shaped how we work: we
                think of the farmer behind every enquiry, and the veterinarian
                standing beside them.
              </p>

              <div className="ab-line rv" style={{ '--d': '.24s' }}>
                Every healthy animal is a family that stays secure.
              </div>

              <p className="rv" style={{ '--d': '.3s' }}>
                Today we work with veterinarians, distributors, retailers and
                animal-care professionals to make dependable veterinary and
                animal-nutrition products easier to find, understand and source.
              </p>
            </div>

            <div className="ab-sub rv">FOR VETERINARIANS & ANIMAL-HEALTH PROFESSIONALS</div>

            <div className="ab-cards">
              {professionalCards.map((card, index) => (
                <div
                  className="ab-card rv"
                  key={card.title}
                  style={{ '--d': `${0.08 * index}s` }}
                >
                  <div className="ab-ic">{card.icon}</div>
                  <h4>{card.title}</h4>
                  <p>{card.text}</p>
                </div>
              ))}
            </div>

            <div className="ab-actions rv">
              <a className="ab-btn" href="#contact">
                Request product information <ArrowUpRight size={16} />
              </a>
              <a className="ab-btn alt" href="#products">
                Browse the range
              </a>
            </div>
          </div>
        </div>

        <div className="ab-stats rv">
          <div className="ab-stat">
            <b>2022</b>
            <span>Year established</span>
          </div>
          <div className="ab-stat">
            <b>Agra</b>
            <span>Uttar Pradesh, India</span>
          </div>
          <div className="ab-stat">
            <b>Vet + Nutrition</b>
            <span>Veterinary products & feed supplements</span>
          </div>
        </div>
      </div>
    </section>
  );
}

const APPROACH_CSS = `
.ap{position:relative;overflow:hidden;background:#ffffff;color:#17261c;padding:clamp(70px,9vw,120px) clamp(20px,5vw,56px)}
.ap::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 12% 18%,rgba(145,182,75,.14),transparent 38%),radial-gradient(circle at 92% 80%,rgba(31,77,44,.08),transparent 40%);pointer-events:none}
.ap-inner{position:relative;z-index:1;max-width:1240px;margin:0 auto}
.ap-top{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(36px,6vw,80px);align-items:center}
.ap-kicker{display:inline-flex;align-items:center;gap:12px;font-size:12px;font-weight:700;letter-spacing:.2em;color:#4f7a1d}
.ap-kicker i{display:block;width:36px;height:2px;background:#91b64b}
.ap-title{font-size:clamp(32px,4.6vw,56px);line-height:1.06;letter-spacing:-.02em;font-weight:700;color:#0f2a1c;margin:16px 0 18px}
.ap-title em{font-style:italic;color:#5f8a1f}
.ap-intro{font-size:17px;line-height:1.8;color:#3b4a40;margin:0 0 26px;max-width:620px}

.ap-medal{position:relative;width:min(100%,400px);aspect-ratio:1;margin:0 auto;display:grid;place-items:center}
.ap-medal svg.ring{position:absolute;inset:0;width:100%;height:100%;animation:apSpin 40s linear infinite}
.ap-medal svg.ring text{font-size:15.5px;font-weight:700;letter-spacing:.22em;fill:#2f6b3a}
.ap-medal .core{position:relative;width:62%;aspect-ratio:1;border-radius:50%;background:#f1f7e8;display:grid;place-items:center;box-shadow:0 30px 60px -28px rgba(13,35,24,.55),inset 0 0 0 10px #fff}
.ap-medal .core img{width:78%;height:78%;object-fit:contain;display:block}
.ap-medal .dot{position:absolute;width:16px;height:16px;border-radius:50%;background:#91b64b;top:8%;right:16%;animation:apPulse 2.6s ease-in-out infinite}
@keyframes apSpin{to{transform:rotate(360deg)}}
@keyframes apPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.7);opacity:.35}}

.ap-points{display:grid;gap:14px}
.ap-point{display:flex;gap:16px;padding:18px 20px;border-radius:18px;background:#f5f8f1;border:1px solid #e1ebda;transition:transform .35s ease,box-shadow .35s ease,border-color .35s ease}
.ap-point:hover{transform:translateX(8px);border-color:#91b64b;box-shadow:0 18px 34px -22px rgba(13,35,24,.45)}
.ap-point svg{flex:none;color:#4f7a1d;margin-top:2px}
.ap-point b{display:block;color:#0f2a1c;font-size:16.5px}
.ap-point small{display:block;margin-top:4px;color:#4a5b50;font-size:14.5px;line-height:1.65}

.ap-steps-head{text-align:center;margin:clamp(60px,7vw,100px) auto 38px;max-width:640px}
.ap-steps-head h3{font-size:clamp(26px,3.2vw,38px);color:#0f2a1c;margin:12px 0 8px;line-height:1.15}
.ap-steps-head p{margin:0;color:#4a5b50;font-size:16px;line-height:1.7}
.ap-steps{position:relative;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}
.ap-line{position:absolute;top:29px;left:12.5%;right:12.5%;height:2px;background:#dce7d6;z-index:0}
.ap-line::after{content:"";position:absolute;inset:0;background:#91b64b;transform:scaleX(0);transform-origin:left;transition:transform 2s ease .3s}
.ap-steps.in .ap-line::after{transform:scaleX(1)}
.ap-step{position:relative;z-index:1;text-align:center;padding:0 8px}
.ap-num{width:58px;height:58px;margin:0 auto 18px;border-radius:50%;display:grid;place-items:center;background:#0f2a1c;color:#b7e04f;font-weight:700;font-size:18px;box-shadow:0 0 0 7px #fff;transition:.35s}
.ap-step:hover .ap-num{background:#91b64b;color:#0d2318;transform:scale(1.08)}
.ap-step h4{margin:0 0 8px;font-size:18px;color:#0f2a1c}
.ap-step p{margin:0;font-size:14.5px;line-height:1.7;color:#4a5b50}

.ap-cta{position:relative;margin-top:clamp(56px,6vw,90px);padding:clamp(28px,4vw,48px);border-radius:28px;background:linear-gradient(135deg,#0f2a1c,#1f4d2c);color:#fff;display:flex;flex-wrap:wrap;gap:24px;align-items:center;justify-content:space-between;overflow:hidden}
.ap-cta::after{content:"";position:absolute;width:320px;height:320px;right:-90px;top:-120px;border-radius:50%;background:radial-gradient(circle,rgba(183,224,79,.35),transparent 70%)}
.ap-cta h3{position:relative;z-index:1;margin:0 0 8px;font-size:clamp(22px,2.6vw,32px);line-height:1.2}
.ap-cta p{position:relative;z-index:1;margin:0;color:rgba(255,255,255,.82);max-width:560px;line-height:1.7}
.ap-cta a{position:relative;z-index:1;display:inline-flex;align-items:center;gap:8px;padding:15px 28px;border-radius:999px;background:#b7e04f;color:#0d2318;font-weight:700;text-decoration:none;transition:.3s}
.ap-cta a:hover{background:#fff;transform:translateY(-2px)}

@media (max-width:900px){
  .ap-top{grid-template-columns:1fr}
  .ap-medal{width:min(100%,320px)}
  .ap-steps{grid-template-columns:1fr;gap:28px}
  .ap-line{display:none}
  .ap-step{display:grid;grid-template-columns:58px 1fr;gap:16px;text-align:left;align-items:start}
  .ap-num{margin:0}
}
@media (prefers-reduced-motion:reduce){
  .ap-medal svg.ring,.ap-medal .dot{animation:none}
  .ap-line::after{transition:none;transform:scaleX(1)}
}
`;

function ApproachSection() {
  const ref = useReveal();

  const principles = [
    {
      title: 'Clear communication',
      text:
        'Straightforward, timely replies to every product enquiry, with no confusing jargon.'
    },
    {
      title: 'Product-focused guidance',
      text:
        'Relevant product information to help veterinarians and buyers make informed decisions.'
    },
    {
      title: 'Long-term relationships',
      text:
        'Service built around people and partnerships, not one-time transactions.'
    }
  ];

  const steps = [
    {
      title: 'Enquire',
      text: 'Tell us the product, species or requirement you have in mind.'
    },
    {
      title: 'Understand',
      text: 'Our team reviews your need and shares relevant product information.'
    },
    {
      title: 'Confirm',
      text: 'We confirm availability, pack details and the next steps with you.'
    },
    {
      title: 'Support',
      text: 'We stay in touch after supply, because relationships outlast orders.'
    }
  ];

  return (
    <section className="ap" id="approach" ref={ref}>
      <style>{APPROACH_CSS}</style>

      <div className="ap-inner">
        <div className="ap-top">
          <div className="ap-medal rv">
            <svg className="ring" viewBox="0 0 300 300" aria-hidden="true">
              <defs>
                <path
                  id="apRingPath"
                  d="M150,150 m-122,0 a122,122 0 1,1 244,0 a122,122 0 1,1 -244,0"
                />
              </defs>
              <text>
                <textPath href="#apRingPath">
                  BOS INDUCS PHARMACEUTICALS • AGRA • EST. 2022 •
                </textPath>
              </text>
            </svg>

            <div className="core">
              <img src={logo} alt="Bos Inducs Pharmaceuticals logo" />
            </div>

            <span className="dot" />
          </div>

          <div>
            <div className="ap-kicker rv"><i /> 03 / OUR APPROACH</div>

            <h2 className="ap-title rv" style={{ '--d': '.08s' }}>
              Good business starts with <em>trust and clarity.</em>
            </h2>

            <p className="ap-intro rv" style={{ '--d': '.14s' }}>
              Every enquiry is a chance to understand what an animal, a farmer
              or a veterinarian really needs. We keep our process simple,
              honest and personal, so you always know where you stand.
            </p>

            <div className="ap-points">
              {principles.map((item, index) => (
                <div
                  className="ap-point rv"
                  key={item.title}
                  style={{ '--d': `${0.1 * index + 0.2}s` }}
                >
                  <CheckCircle2 size={24} />
                  <span>
                    <b>{item.title}</b>
                    <small>{item.text}</small>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="ap-steps-head rv">
          <div className="ap-kicker" style={{ justifyContent: 'center' }}>
            <i /> HOW WE WORK WITH YOU
          </div>
          <h3>From first enquiry to lasting partnership</h3>
          <p>
            A simple four-step process designed to save your time and give you
            the information you need.
          </p>
        </div>

        <div className="ap-steps rv">
          <div className="ap-line" aria-hidden="true" />

          {steps.map((step, index) => (
            <div className="ap-step" key={step.title}>
              <div className="ap-num">{String(index + 1).padStart(2, '0')}</div>
              <div>
                <h4>{step.title}</h4>
                <p>{step.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="ap-cta rv">
          <div>
            <h3>Veterinarian, distributor or retailer?</h3>
            <p>
              Tell us what you are looking for and our team will get back to you
              with product information and availability.
            </p>
          </div>

          <a href="#contact">
            Start an enquiry <ArrowUpRight size={17} />
          </a>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------
// Social media links  ->  EDIT THESE with your real page links
// ---------------------------------------------------------------
const SOCIAL_LINKS = [
  { name: 'Instagram', href: 'https://www.instagram.com/', Icon: Instagram, cls: 'ig' },
  { name: 'Facebook', href: 'https://www.facebook.com/', Icon: Facebook, cls: 'fb' },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/', Icon: Linkedin, cls: 'in' }
];

const NAV_ITEMS = [
  ['home', 'Home'],
  ['about', 'About us'],
  ['products', 'Products'],
  ['approach', 'Our approach'],
  ['contact', 'Contact']
];

const HEADER_CSS = `
html{scroll-behavior:smooth}
section[id]{scroll-margin-top:76px}
.sh{position:sticky;top:0;z-index:1000;background:rgba(13,35,24,.74);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid rgba(255,255,255,.08);transition:background .35s,box-shadow .35s}
.sh.scrolled{background:rgba(9,26,17,.95);box-shadow:0 12px 30px -14px rgba(0,0,0,.6)}
.sh-in{max-width:1320px;margin:0 auto;height:78px;padding:0 clamp(16px,4vw,40px);display:flex;align-items:center;gap:24px;transition:height .3s}
.sh.scrolled .sh-in{height:66px}
.sh-brand{display:flex;align-items:center;gap:13px;text-decoration:none;color:#fff;flex:none}
.sh-logo{width:50px;height:50px;border-radius:50%;background:#fff;padding:2px;box-shadow:0 0 0 2px #91b64b,0 8px 20px -8px rgba(0,0,0,.6);transition:transform .5s ease,width .3s,height .3s}
.sh.scrolled .sh-logo{width:44px;height:44px}
.sh-brand:hover .sh-logo{transform:rotate(-8deg) scale(1.06)}
.sh-logo img{width:100%;height:100%;object-fit:contain;display:block;border-radius:50%}
.sh-name b{display:block;font-size:17px;letter-spacing:.14em;line-height:1.1;color:#fff}
.sh-name small{display:block;font-size:10px;letter-spacing:.36em;color:#b7e04f;margin-top:4px}
.sh-nav{position:relative;margin:0 auto;display:flex;gap:2px;padding:5px;border-radius:999px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1)}
.sh-pill{position:absolute;top:5px;bottom:5px;border-radius:999px;background:#b7e04f;box-shadow:0 6px 18px -6px rgba(183,224,79,.7);transition:left .45s cubic-bezier(.3,1.25,.5,1),width .45s cubic-bezier(.3,1.25,.5,1),opacity .3s;z-index:0}
.sh-link{position:relative;z-index:1;padding:10px 19px;border-radius:999px;color:rgba(255,255,255,.82);font-size:14.5px;font-weight:600;text-decoration:none;transition:color .3s,transform .15s;white-space:nowrap}
.sh-link:hover{color:#fff}
.sh-link:active{transform:scale(.94)}
.sh-link.active{color:#0d2318}
.sh-cta{display:inline-flex;align-items:center;gap:8px;flex:none;padding:12px 22px;border-radius:999px;background:linear-gradient(135deg,#b7e04f,#91b64b);color:#0d2318;font-weight:700;font-size:14.5px;text-decoration:none;box-shadow:0 10px 24px -10px rgba(183,224,79,.8);transition:transform .3s,box-shadow .3s}
.sh-cta:hover{transform:translateY(-2px);box-shadow:0 16px 30px -10px rgba(183,224,79,.9)}
.sh-toggle{display:none;margin-left:auto;width:44px;height:44px;border-radius:12px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);color:#fff;cursor:pointer;place-items:center}
@media (max-width:980px){
  .sh-in{height:68px}
  .sh-toggle{display:grid}
  .sh-cta{display:none}
  .sh-nav{position:fixed;left:0;right:0;top:68px;margin:0;border-radius:0 0 22px 22px;flex-direction:column;gap:4px;padding:16px;background:#0a1f14;border:none;border-top:1px solid rgba(255,255,255,.08);box-shadow:0 30px 50px -20px rgba(0,0,0,.7);opacity:0;visibility:hidden;transform:translateY(-14px);transition:.3s}
  .sh-nav.open{opacity:1;visibility:visible;transform:none}
  .sh-pill{display:none}
  .sh-link{padding:15px 18px;border-radius:14px;font-size:16px}
  .sh-link.active{background:rgba(183,224,79,.16);color:#b7e04f}
  .sh-mcta{display:flex!important}
}
.sh-mcta{display:none;margin-top:8px;justify-content:center;align-items:center;gap:8px;padding:15px;border-radius:14px;background:#b7e04f;color:#0d2318;font-weight:700;text-decoration:none}
@media (max-width:420px){.sh-name small{display:none}.sh-name b{font-size:15px}}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}.sh-pill{transition:none}}
`;

function SiteHeader({ base = '' }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState(base ? null : 'home');
  const [pill, setPill] = useState({ left: 0, width: 0, show: false });
  const linkRefs = useRef({});

  // Track scroll position and highlight the section currently in view
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);

      if (base) return;

      let current = 'home';

      NAV_ITEMS.forEach(([id]) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 150) {
          current = id;
        }
      });

      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;

      if (atBottom) current = 'contact';

      setActive(current);
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, [base]);

  // Move the sliding highlight behind the active link
  useLayoutEffect(() => {
    function measure() {
      const el = active ? linkRefs.current[active] : null;

      if (!el) {
        setPill(previous => ({ ...previous, show: false }));
        return;
      }

      setPill({ left: el.offsetLeft, width: el.offsetWidth, show: true });
    }

    measure();
    window.addEventListener('resize', measure);

    return () => window.removeEventListener('resize', measure);
  }, [active]);

  function handleClick(id) {
    setActive(id);
    setOpen(false);
  }

  return (
    <header className={scrolled ? 'sh scrolled' : 'sh'}>
      <style>{HEADER_CSS}</style>

      <div className="sh-in">
        <a className="sh-brand" href={base ? '/' : '#home'} aria-label="Bos Inducs Pharmaceuticals home" onClick={() => handleClick('home')}>
          <span className="sh-logo">
            <img src={logo} alt="Bos Inducs Pharmaceuticals" />
          </span>
          <span className="sh-name">
            <b>BOS INDUCS</b>
            <small>PHARMACEUTICALS</small>
          </span>
        </a>

        <nav className={open ? 'sh-nav open' : 'sh-nav'} aria-label="Main navigation">
          <span
            className="sh-pill"
            style={{
              left: pill.left,
              width: pill.width,
              opacity: pill.show ? 1 : 0
            }}
          />

          {NAV_ITEMS.map(([id, label]) => (
            <a
              key={id}
              ref={el => {
                linkRefs.current[id] = el;
              }}
              href={`${base}#${id}`}
              className={active === id ? 'sh-link active' : 'sh-link'}
              aria-current={active === id ? 'true' : undefined}
              onClick={() => handleClick(id)}
            >
              {label}
            </a>
          ))}

          <a className="sh-mcta" href={`${base}#contact`} onClick={() => handleClick('contact')}>
            Make an enquiry <ArrowUpRight size={16} />
          </a>
        </nav>

        <a className="sh-cta" href={`${base}#contact`} onClick={() => handleClick('contact')}>
          Make an enquiry <ArrowUpRight size={16} />
        </a>

        <button
          type="button"
          className="sh-toggle"
          onClick={() => setOpen(previous => !previous)}
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
}

const FOOTER_CSS = `
.sf{background:#081a10;color:rgba(255,255,255,.78);padding:clamp(50px,6vw,84px) clamp(20px,5vw,56px) 0;position:relative;overflow:hidden}
.sf::before{content:"";position:absolute;width:480px;height:480px;right:-160px;top:-200px;border-radius:50%;background:radial-gradient(circle,rgba(145,182,75,.18),transparent 70%);pointer-events:none}
.sf-grid{position:relative;max-width:1240px;margin:0 auto;display:grid;grid-template-columns:1.7fr 1fr 1.2fr;gap:clamp(30px,5vw,64px)}
.sf-brand{display:flex;align-items:center;gap:14px;color:#fff;text-decoration:none}
.sf-brand .lg{width:58px;height:58px;border-radius:50%;background:#fff;padding:2px;box-shadow:0 0 0 2px #91b64b}
.sf-brand .lg img{width:100%;height:100%;object-fit:contain;border-radius:50%;display:block}
.sf-brand b{display:block;letter-spacing:.14em;font-size:18px}
.sf-brand small{display:block;letter-spacing:.34em;font-size:10px;color:#b7e04f;margin-top:4px}
.sf-about{margin:20px 0 24px;line-height:1.8;font-size:14.5px;max-width:420px}
.sf-follow{font-size:12px;letter-spacing:.18em;color:#b7e04f;font-weight:700;margin-bottom:12px}
.sf-social{display:flex;gap:12px}
.sf-social a{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;color:#fff;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.06);transition:transform .3s,background .3s,border-color .3s}
.sf-social a:hover{transform:translateY(-5px) scale(1.06);border-color:transparent}
.sf-social a.ig:hover{background:linear-gradient(45deg,#f9a825,#ee2a7b 55%,#6228d7)}
.sf-social a.fb:hover{background:#1877f2}
.sf-social a.in:hover{background:#0a66c2}
.sf h5{margin:4px 0 18px;color:#fff;font-size:13px;letter-spacing:.2em}
.sf-links{display:grid;gap:11px}
.sf-links a{color:rgba(255,255,255,.75);text-decoration:none;font-size:14.5px;transition:color .25s,padding-left .25s;width:fit-content}
.sf-links a:hover{color:#b7e04f;padding-left:6px}
.sf-contact p{display:flex;gap:10px;align-items:flex-start;margin:0 0 12px;font-size:14.5px;line-height:1.6}
.sf-contact svg{flex:none;color:#b7e04f;margin-top:3px}
.sf-contact a{color:#b7e04f;text-decoration:none}
.sf-bottom{position:relative;max-width:1240px;margin:clamp(36px,5vw,60px) auto 0;padding:22px 0;border-top:1px solid rgba(255,255,255,.12);display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;font-size:13px}
.sf-bottom a{color:#b7e04f;text-decoration:none;letter-spacing:.12em;font-weight:600}
@media (max-width:860px){.sf-grid{grid-template-columns:1fr}}
`;

function SiteFooter({ base = '', whatsappNumber = '' }) {
  return (
    <footer className="sf">
      <style>{FOOTER_CSS}</style>

      <div className="sf-grid">
        <div>
          <a className="sf-brand" href={base ? '/' : '#home'}>
            <span className="lg"><img src={logo} alt="Bos Inducs Pharmaceuticals" /></span>
            <span>
              <b>BOS INDUCS</b>
              <small>PHARMACEUTICALS</small>
            </span>
          </a>

          <p className="sf-about">
            Agra-based veterinary and animal-nutrition company, established in
            2022 and supporting animal-care professionals with dependable
            products and honest guidance.
          </p>

          <div className="sf-follow">FOLLOW US</div>
          <div className="sf-social">
            {SOCIAL_LINKS.map(({ name, href, Icon, cls }) => (
              <a
                key={name}
                href={href}
                className={cls}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Bos Inducs on ${name}`}
                title={name}
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h5>EXPLORE</h5>
          <div className="sf-links">
            {NAV_ITEMS.map(([id, label]) => (
              <a key={id} href={`${base}#${id}`}>{label}</a>
            ))}
          </div>
        </div>

        <div className="sf-contact">
          <h5>REACH US</h5>
          <p><MapPin size={18} /> Bos Inducs Pharmaceuticals, Agra, Uttar Pradesh, India</p>
          <p>
            <ArrowUpRight size={18} />
            <a href={`${base}#contact`}>Send an enquiry online</a>
          </p>
          {whatsappNumber && (
            <p>
              <MessageCircle size={18} />
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello Bos Inducs Pharmaceuticals, I would like to know more about your products.')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Chat on WhatsApp
              </a>
            </p>
          )}
        </div>
      </div>

      <div className="sf-bottom">
        <span>
          © {new Date().getFullYear()} Bos Inducs Pharmaceuticals. All rights reserved.
        </span>
        <a href={base ? '/' : '#home'}>BACK TO TOP ↑</a>
      </div>
    </footer>
  );
}

const PRODUCTS_CSS = `
.pr{position:relative;overflow:hidden;background:linear-gradient(180deg,#0d2318 0,#112f1e 100%);color:#fff;padding:clamp(70px,9vw,120px) clamp(20px,5vw,56px)}
.pr::before{content:"";position:absolute;width:620px;height:620px;left:-220px;top:-200px;border-radius:50%;background:radial-gradient(circle,rgba(145,182,75,.2),transparent 70%);pointer-events:none}
.pr::after{content:"";position:absolute;width:520px;height:520px;right:-200px;bottom:-200px;border-radius:50%;background:radial-gradient(circle,rgba(183,224,79,.12),transparent 70%);pointer-events:none}
.pr-inner{position:relative;z-index:1;max-width:1240px;margin:0 auto}
.pr-kicker{display:inline-flex;align-items:center;gap:12px;font-size:12px;font-weight:700;letter-spacing:.2em;color:#b7e04f}
.pr-kicker i{display:block;width:36px;height:2px;background:#91b64b}
.pr-head{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:36px;align-items:end;margin-top:16px}
.pr-title{font-size:clamp(34px,5vw,62px);line-height:1.04;letter-spacing:-.02em;margin:0 0 16px;color:#fff;font-weight:700}
.pr-title em{font-style:italic;color:#b7e04f}
.pr-head p{margin:0;color:rgba(255,255,255,.8);font-size:16.5px;line-height:1.8;max-width:620px}
.pr-note{display:flex;gap:14px;padding:20px;border-radius:20px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(8px)}
.pr-note .ic{flex:none;width:46px;height:46px;border-radius:14px;background:#b7e04f;color:#0d2318;display:grid;place-items:center}
.pr-note b{display:block;font-size:16px}
.pr-note small{display:block;margin:3px 0 8px;color:rgba(255,255,255,.75);font-size:13.5px}
.pr-note a{color:#b7e04f;font-weight:600;text-decoration:none;font-size:14px;display:inline-flex;align-items:center;gap:4px}

.pr-controls{display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:space-between;margin:clamp(32px,4vw,52px) 0 14px}
.pr-tabs{display:flex;flex-wrap:wrap;gap:10px}
.pr-tab{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:999px;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.05);color:rgba(255,255,255,.88);font-size:14px;font-weight:600;cursor:pointer;transition:.3s}
.pr-tab span{font-size:11.5px;padding:2px 8px;border-radius:999px;background:rgba(255,255,255,.14)}
.pr-tab:hover{background:rgba(255,255,255,.14);transform:translateY(-2px)}
.pr-tab.active{background:#b7e04f;border-color:#b7e04f;color:#0d2318}
.pr-tab.active span{background:rgba(13,35,24,.15)}
.pr-search{position:relative;display:flex;align-items:center;gap:10px;min-width:min(100%,300px);padding:0 16px;height:48px;border-radius:999px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.22);color:rgba(255,255,255,.8);transition:.3s}
.pr-search:focus-within{background:rgba(255,255,255,.16);border-color:#b7e04f}
.pr-search input{flex:1;min-width:0;background:transparent;border:none;outline:none;color:#fff;font-size:15px}
.pr-search input::placeholder{color:rgba(255,255,255,.6)}
.pr-search button{border:none;background:rgba(255,255,255,.18);color:#fff;width:24px;height:24px;border-radius:50%;display:grid;place-items:center;cursor:pointer}
.pr-meta{margin:0 0 26px;font-size:13.5px;color:rgba(255,255,255,.7);letter-spacing:.04em}

.pr-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:26px}
.pr-card{position:relative;display:flex;flex-direction:column;background:#fff;color:#17261c;border-radius:24px;overflow:hidden;cursor:pointer;box-shadow:0 20px 40px -26px rgba(0,0,0,.7);transition:transform .45s cubic-bezier(.2,.7,.2,1),box-shadow .45s;animation:prIn .7s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(var(--i,0) * 70ms)}
.pr-card:hover,.pr-card:focus-visible{transform:translateY(-10px);box-shadow:0 34px 60px -26px rgba(0,0,0,.85);outline:none}
.pr-card:focus-visible{box-shadow:0 0 0 3px #b7e04f,0 34px 60px -26px rgba(0,0,0,.85)}
@keyframes prIn{from{opacity:0;transform:translateY(34px)}to{opacity:1;transform:none}}
.pr-img{position:relative;aspect-ratio:4/3;background:linear-gradient(145deg,#eef5e6,#d9e7cc);overflow:hidden}
.pr-img-inner{position:absolute;inset:16px}
.pr-img-inner img{transition:transform .7s cubic-bezier(.2,.7,.2,1)}
.pr-card:hover .pr-img-inner img{transform:scale(1.08)}
.pr-tag{position:absolute;top:14px;left:14px;z-index:2;padding:6px 12px;border-radius:999px;background:#0f2a1c;color:#b7e04f;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;max-width:70%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pr-no{position:absolute;top:10px;right:16px;z-index:2;font-size:26px;font-weight:800;color:rgba(15,42,28,.16)}
.pr-view{position:absolute;left:0;right:0;bottom:0;z-index:3;padding:12px;text-align:center;background:linear-gradient(0deg,rgba(15,42,28,.92),rgba(15,42,28,.7));color:#fff;font-size:13.5px;font-weight:600;transform:translateY(100%);transition:transform .4s cubic-bezier(.2,.7,.2,1)}
.pr-card:hover .pr-view,.pr-card:focus-visible .pr-view{transform:none}
.pr-body{display:flex;flex-direction:column;gap:8px;padding:20px 22px 22px;flex:1}
.pr-cat{font-size:11.5px;font-weight:700;letter-spacing:.16em;color:#4f7a1d;text-transform:uppercase}
.pr-body h3{margin:0;font-size:20px;line-height:1.25;color:#0f2a1c}
.pr-body p{margin:0;font-size:14.5px;line-height:1.7;color:#4a5b50;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.pr-actions{display:flex;gap:10px;margin-top:auto;padding-top:14px}
.pr-enq{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 16px;border-radius:14px;background:#0f2a1c;color:#fff;font-size:14px;font-weight:600;text-decoration:none;transition:.3s}
.pr-enq:hover{background:#91b64b;color:#0d2318}
.pr-go{width:46px;height:46px;flex:none;border-radius:14px;border:1.5px solid #d3e1cb;display:grid;place-items:center;color:#0f2a1c;transition:.3s}
.pr-card:hover .pr-go{background:#b7e04f;border-color:#b7e04f;transform:rotate(45deg)}

.pr-skel{border-radius:24px;overflow:hidden;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1)}
.pr-skel div{background:linear-gradient(100deg,rgba(255,255,255,.05) 20%,rgba(255,255,255,.18) 40%,rgba(255,255,255,.05) 60%);background-size:220% 100%;animation:prShim 1.4s linear infinite}
.pr-skel .a{aspect-ratio:4/3}
.pr-skel .b{height:14px;margin:18px 20px 0;border-radius:8px;width:40%}
.pr-skel .c{height:20px;margin:12px 20px 0;border-radius:8px;width:75%}
.pr-skel .d{height:44px;margin:16px 20px 22px;border-radius:12px}
@keyframes prShim{to{background-position:-220% 0}}

.pr-empty{display:flex;flex-direction:column;align-items:center;gap:12px;padding:52px 24px;text-align:center;border-radius:24px;border:1.5px dashed rgba(255,255,255,.25);background:rgba(255,255,255,.05);color:rgba(255,255,255,.85)}
.pr-empty svg{color:#b7e04f}
.pr-empty button{margin-top:6px;padding:10px 20px;border-radius:999px;border:none;background:#b7e04f;color:#0d2318;font-weight:700;cursor:pointer}
.pr-disc{margin:clamp(36px,4vw,56px) 0 0;padding-top:22px;border-top:1px solid rgba(255,255,255,.14);font-size:13px;line-height:1.7;color:rgba(255,255,255,.65);max-width:860px}

@media (max-width:860px){.pr-head{grid-template-columns:1fr}}
@media (max-width:560px){.pr-grid{grid-template-columns:1fr}.pr-search{width:100%}}
@media (prefers-reduced-motion:reduce){.pr-card{animation:none}.pr-skel div{animation:none}}
`;

const CONTACT_CSS = `
.ct{position:relative;overflow:hidden;background:linear-gradient(160deg,#0d2318 0,#163d27 100%);color:#fff;padding:clamp(70px,9vw,120px) clamp(20px,5vw,56px)}
.ct::before{content:"";position:absolute;width:560px;height:560px;left:-200px;bottom:-220px;border-radius:50%;background:radial-gradient(circle,rgba(183,224,79,.2),transparent 70%);pointer-events:none}
.ct-grid{position:relative;z-index:1;max-width:1240px;margin:0 auto;display:grid;grid-template-columns:minmax(0,5fr) minmax(0,6fr);gap:clamp(36px,6vw,84px);align-items:start}
.ct-kicker{display:inline-flex;align-items:center;gap:12px;font-size:12px;font-weight:700;letter-spacing:.2em;color:#b7e04f}
.ct-kicker i{display:block;width:36px;height:2px;background:#91b64b}
.ct-title{font-size:clamp(34px,5vw,62px);line-height:1.05;letter-spacing:-.02em;margin:16px 0 18px;font-weight:700;color:#fff}
.ct-title em{font-style:italic;color:#b7e04f}
.ct-lead{margin:0 0 28px;font-size:16.5px;line-height:1.8;color:rgba(255,255,255,.82);max-width:520px}
.ct-info{display:grid;gap:12px;margin-bottom:28px}
.ct-item{display:flex;align-items:center;gap:14px;padding:16px 18px;border-radius:18px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);color:#fff;text-decoration:none;transition:.3s}
a.ct-item:hover{background:rgba(255,255,255,.14);transform:translateX(6px)}
.ct-item .ic{flex:none;width:46px;height:46px;border-radius:14px;background:#b7e04f;color:#0d2318;display:grid;place-items:center}
.ct-item b{display:block;font-size:15.5px}
.ct-item small{display:block;color:rgba(255,255,255,.72);font-size:13.5px;margin-top:2px}
.ct-who{font-size:12px;letter-spacing:.16em;font-weight:700;color:#b7e04f;margin-bottom:12px}
.ct-chips{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:30px}
.ct-chips span{padding:8px 16px;border-radius:999px;border:1px solid rgba(255,255,255,.25);font-size:13.5px;color:#fff;background:rgba(255,255,255,.06)}
.ct-next{display:grid;gap:12px}
.ct-next div{display:flex;gap:12px;align-items:center;font-size:14.5px;color:rgba(255,255,255,.85)}
.ct-next em{flex:none;width:28px;height:28px;border-radius:50%;background:rgba(183,224,79,.2);color:#b7e04f;display:grid;place-items:center;font-style:normal;font-size:12px;font-weight:700}

.ct-form{background:#fff;color:#17261c;border-radius:28px;padding:clamp(24px,3.4vw,42px);box-shadow:0 40px 80px -30px rgba(0,0,0,.7);display:grid;gap:18px}
.ct-fh{display:flex;justify-content:space-between;align-items:center;gap:12px;padding-bottom:16px;border-bottom:1px solid #e3ebdd}
.ct-fh b{font-size:20px;color:#0f2a1c}
.ct-fh span{font-size:12px;letter-spacing:.14em;color:#4f7a1d;font-weight:700}
.ct-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.ct-form label{display:grid;gap:8px;font-size:13.5px;font-weight:600;color:#2a3b30}
.ct-form label .req{color:#d9534f}
.ct-form label .optional{font-weight:400;color:#7a8a80}
.ct-form input,.ct-form textarea{width:100%;box-sizing:border-box;padding:14px 16px;border-radius:14px;border:1.5px solid #d6e3cf;background:#f7faf4;color:#17261c;font-size:15px;font-family:inherit;transition:.25s;outline:none}
.ct-form textarea{resize:vertical;min-height:130px}
.ct-form input::placeholder,.ct-form textarea::placeholder{color:#8a9a90}
.ct-form input:focus,.ct-form textarea:focus{border-color:#91b64b;background:#fff;box-shadow:0 0 0 4px rgba(145,182,75,.22)}
.ct-submit{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:16px 26px;border:none;border-radius:16px;background:#0f2a1c;color:#fff;font-size:16px;font-weight:700;cursor:pointer;transition:.3s}
.ct-submit:hover:not(:disabled){background:#91b64b;color:#0d2318;transform:translateY(-2px)}
.ct-submit:disabled{opacity:.75;cursor:wait}
.ct-spin{width:18px;height:18px;border-radius:50%;border:2.5px solid rgba(255,255,255,.35);border-top-color:#fff;animation:ctSpin .8s linear infinite}
@keyframes ctSpin{to{transform:rotate(360deg)}}
.ct-notice{display:flex;gap:10px;align-items:flex-start;margin:0;padding:14px 16px;border-radius:14px;font-size:14.5px;line-height:1.6;background:#e8f4d6;color:#2b5314;border:1px solid #c7e29c;animation:ctPop .4s ease}
.ct-notice.err{background:#fdeceb;color:#a02722;border-color:#f3bcb8}
.ct-notice svg{flex:none;margin-top:2px}
@keyframes ctPop{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.ct-priv{margin:0;text-align:center;font-size:12.5px;color:#6c7c72}
@media (max-width:900px){.ct-grid{grid-template-columns:1fr}}
@media (max-width:560px){.ct-row{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){.ct-spin{animation:none}.ct-notice{animation:none}}
`;

// Main company website
function Website() {
  // Product states
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState('');

  // Product filters
  const [category, setCategory] = useState('All products');
  const [query, setQuery] = useState('');

  // Enquiry form
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState('');
  const [noticeError, setNoticeError] = useState(false);

  // Load products from backend
  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || ''}/api/products`
        );

        if (!response.ok) {
          throw new Error(
            'Unable to load products. Please try again later.'
          );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error(
            'Invalid product data received from the server.'
          );
        }

        if (isMounted) {
          setProducts(data);
          setProductsError('');
        }
      } catch (error) {
        if (isMounted) {
          setProductsError(
            error.message ||
            'Something went wrong while loading products.'
          );
        }
      } finally {
        if (isMounted) {
          setLoadingProducts(false);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Create category filters from database products
  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        products
          .map(product => product.category)
          .filter(Boolean)
      )
    ];

    return ['All products', ...uniqueCategories];
  }, [products]);

  // Filter products
  const visibleProducts = useMemo(() => {
    const searchText = query.trim().toLowerCase();

    return products.filter(product => {
      const matchesCategory =
        category === 'All products' ||
        product.category === category;

      const searchableText = [
        product.name,
        product.category,
        product.description,
        product.tag
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        searchableText.includes(searchText);

      return matchesCategory && matchesSearch;
    });
  }, [products, category, query]);

  // WhatsApp configuration
  const whatsappNumber = (
    import.meta.env.VITE_WHATSAPP_NUMBER || ''
  ).replace(/\D/g, '');

  // Open product details page
  function openProduct(product) {
    const id = product._id || product.id;

    if (!id) {
      return;
    }

    window.location.href = `/product/${encodeURIComponent(String(id))}`;
  }

  // Update enquiry form
  function handleFormChange(e) {
    const { name, value } = e.target;

    setForm(previousForm => ({
      ...previousForm,
      [name]: value
    }));
  }

  // Submit enquiry
  async function submitEnquiry(e) {
    e.preventDefault();

    setSending(true);
    setNotice('');
    setNoticeError(false);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || ''}/api/enquiries`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
          'Could not send your enquiry. Please try again.'
        );
      }

      setNotice(
        'Thank you! Your enquiry has been received. Our team will get back to you.'
      );

      setForm({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
    } catch (error) {
      setNotice(
        error.message ||
        'Something went wrong. Please try again later.'
      );

      setNoticeError(true);
    } finally {
      setSending(false);
    }
  }

  // Detect product details URL
  const productMatch = window.location.pathname.match(
    /^\/product\/([^/]+)\/?$/
  );

  let productId = null;

  if (productMatch) {
    try {
      productId = decodeURIComponent(productMatch[1]);
    } catch {
      productId = productMatch[1];
    }
  }

  // Show individual product page
  if (productId !== null) {
    return (
      <ProductDetails
        productId={productId}
        products={products}
        loading={loadingProducts}
        whatsappNumber={whatsappNumber}
      />
    );
  }

  return (
    <>
      {/* Announcement bar */}
      <div className="announcement">
        <span className="announcement-dot" />
        Animal health. Thoughtful partnerships.

        <a href="#contact">
          Connect with our team <ArrowUpRight size={13} />
        </a>
      </div>

      {/* Header */}
      <SiteHeader />

      <main>
        {/* Hero slider */}
        <HeroSlider />

        {/* Trust strip */}
        <section className="trust-strip">
          <div>
            <span className="strip-number">01</span>
            <span>
              <b>Veterinary products</b>
              <small>Product enquiries & information</small>
            </span>
          </div>

          <div>
            <span className="strip-number">02</span>
            <span>
              <b>Animal nutrition</b>
              <small>Feed and supplement range</small>
            </span>
          </div>

          <div>
            <span className="strip-number">03</span>
            <span>
              <b>Based in Agra</b>
              <small>Uttar Pradesh, India</small>
            </span>
          </div>
        </section>

        {/* About section */}
        <AboutSection />

        {/* Products section */}
        <section className="pr" id="products">
          <style>{PRODUCTS_CSS}</style>

          <div className="pr-inner">
            <div className="pr-kicker"><i /> 02 / PRODUCT RANGE</div>

            <div className="pr-head">
              <div>
                <h2 className="pr-title">
                  Explore our <em>product range.</em>
                </h2>

                <p>
                  Browse by category and enquire for specifications,
                  availability and catalogue information. Click any product to
                  see its full details.
                </p>
              </div>

              <div className="pr-note">
                <span className="ic"><Stethoscope size={22} /></span>
                <span>
                  <b>Need product guidance?</b>
                  <small>Our team can help with your enquiry.</small>
                  <a href="#contact">
                    Contact us <ArrowUpRight size={14} />
                  </a>
                </span>
              </div>
            </div>

            {/* Filters */}
            <div className="pr-controls">
              <div className="pr-tabs">
                {categories.map(currentCategory => (
                  <button
                    type="button"
                    key={currentCategory}
                    className={
                      category === currentCategory
                        ? 'pr-tab active'
                        : 'pr-tab'
                    }
                    onClick={() => setCategory(currentCategory)}
                  >
                    {currentCategory}
                    <span>
                      {currentCategory === 'All products'
                        ? products.length
                        : products.filter(
                            item => item.category === currentCategory
                          ).length}
                    </span>
                  </button>
                ))}
              </div>

              <label className="pr-search">
                <Search size={17} />

                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search products"
                  aria-label="Search products"
                />

                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </label>
            </div>

            {!loadingProducts && !productsError && (
              <p className="pr-meta">
                Showing {visibleProducts.length} of {products.length} products
              </p>
            )}

            {loadingProducts ? (
              <div className="pr-grid">
                {[0, 1, 2, 3, 4, 5].map(item => (
                  <div className="pr-skel" key={item}>
                    <div className="a" />
                    <div className="b" />
                    <div className="c" />
                    <div className="d" />
                  </div>
                ))}
              </div>
            ) : productsError ? (
              <div className="pr-empty">
                <Search size={34} />
                <b>{productsError}</b>
                <button type="button" onClick={() => window.location.reload()}>
                  Try again
                </button>
              </div>
            ) : (
              <>
                <div className="pr-grid">
                  {visibleProducts.map((product, index) => (
                    <article
                      className="pr-card"
                      key={product._id || product.id || product.name}
                      style={{ '--i': Math.min(index, 8) }}
                      onClick={() => openProduct(product)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openProduct(product);
                        }
                      }}
                      role="link"
                      tabIndex={0}
                      aria-label={`View details for ${product.name}`}
                    >
                      <div className="pr-img">
                        <div className="pr-img-inner">
                          <ProductImage product={product} index={index} />
                        </div>

                        <span className="pr-tag">
                          {product.tag || product.category || 'Product'}
                        </span>

                        <span className="pr-no">
                          {String(index + 1).padStart(2, '0')}
                        </span>

                        <span className="pr-view">View details →</span>
                      </div>

                      <div className="pr-body">
                        <div className="pr-cat">
                          {product.category || 'General'}
                        </div>

                        <h3>{product.name}</h3>

                        <p>
                          {product.description ||
                            'Contact our team for product details and availability.'}
                        </p>

                        <div className="pr-actions">
                          <a
                            href={
                              whatsappNumber
                                ? getWhatsAppLink(whatsappNumber, product.name)
                                : '#contact'
                            }
                            target={whatsappNumber ? '_blank' : undefined}
                            rel={
                              whatsappNumber
                                ? 'noopener noreferrer'
                                : undefined
                            }
                            className="pr-enq"
                            onClick={e => e.stopPropagation()}
                          >
                            <MessageCircle size={16} /> Enquire
                          </a>

                          <span className="pr-go" aria-hidden="true">
                            <ArrowUpRight size={18} />
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {visibleProducts.length === 0 && (
                  <div className="pr-empty">
                    <Search size={34} />
                    <b>No products match your search.</b>
                    <span>Try another name or choose a different category.</span>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery('');
                        setCategory('All products');
                      }}
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </>
            )}

            <p className="pr-disc">
              Product names are shown for catalogue discovery. Please contact
              the company for current specifications, pack details,
              availability and applicable product information.
            </p>
          </div>
        </section>

        {/* Our approach */}
        <ApproachSection />

        {/* Contact section */}
        <section className="ct" id="contact">
          <style>{CONTACT_CSS}</style>

          <div className="ct-grid">
            <div>
              <div className="ct-kicker"><i /> 04 / GET IN TOUCH</div>

              <h2 className="ct-title">
                Let's start a <em>conversation.</em>
              </h2>

              <p className="ct-lead">
                Looking for product information, availability or a business
                association? Send us a message and our team will follow up
                personally.
              </p>

              <div className="ct-info">
                <div className="ct-item">
                  <span className="ic"><MapPin size={22} /></span>
                  <span>
                    <b>Bos Inducs Pharmaceuticals</b>
                    <small>Agra, Uttar Pradesh, India</small>
                  </span>
                </div>

                {whatsappNumber && (
                  <a
                    className="ct-item"
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello Bos Inducs Pharmaceuticals, I would like to know more about your products.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="ic"><MessageCircle size={22} /></span>
                    <span>
                      <b>Chat on WhatsApp</b>
                      <small>Quick questions, quick answers</small>
                    </span>
                  </a>
                )}
              </div>

              <div className="ct-who">WHO CAN ENQUIRE</div>
              <div className="ct-chips">
                <span>Veterinarians</span>
                <span>Distributors</span>
                <span>Retailers</span>
                <span>Dairy farmers</span>
              </div>

              <div className="ct-who">WHAT HAPPENS NEXT</div>
              <div className="ct-next">
                <div><em>1</em> We receive your enquiry</div>
                <div><em>2</em> Our team reviews what you need</div>
                <div><em>3</em> We get back to you with the details</div>
              </div>
            </div>

            {/* Enquiry form */}
            <form className="ct-form" onSubmit={submitEnquiry}>
              <div className="ct-fh">
                <b>Send us an enquiry</b>
                <span>BOS INDUCS</span>
              </div>

              <div className="ct-row">
                <label>
                  <span>Your name <span className="req">*</span></span>

                  <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleFormChange}
                    placeholder="Enter your name"
                  />
                </label>

                <label>
                  <span>Email address <span className="req">*</span></span>

                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleFormChange}
                    placeholder="you@example.com"
                  />
                </label>
              </div>

              <label>
                <span>Phone number <span className="optional">(optional)</span></span>

                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleFormChange}
                  placeholder="Your contact number"
                />
              </label>

              <label>
                <span>How can we help? <span className="req">*</span></span>

                <textarea
                  name="message"
                  required
                  rows="4"
                  value={form.message}
                  onChange={handleFormChange}
                  placeholder="Tell us which product or information you are looking for..."
                />
              </label>

              <button className="ct-submit" type="submit" disabled={sending}>
                {sending ? (
                  <>
                    <span className="ct-spin" /> Sending...
                  </>
                ) : (
                  <>
                    Send enquiry <ArrowUpRight size={18} />
                  </>
                )}
              </button>

              {notice && (
                <p
                  className={noticeError ? 'ct-notice err' : 'ct-notice'}
                  role="status"
                >
                  {noticeError ? <X size={18} /> : <CheckCircle2 size={18} />}
                  <span>{notice}</span>
                </p>
              )}

              <p className="ct-priv">
                Your details will only be used to respond to this enquiry.
              </p>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <SiteFooter whatsappNumber={whatsappNumber} />

      {/* Floating contact button */}
      <a
        className="floating-contact"
        href="#contact"
        aria-label="Contact us"
      >
        <MessageCircle size={19} />
        <span>Enquire</span>
      </a>
    </>
  );
}

// App routing: website at / and admin dashboard at /admin
export default function App() {
  const currentPath = window.location.pathname.replace(/\/+$/, '');

  if (currentPath === '/admin') {
    return <Admin />;
  }

  return <Website />;
}