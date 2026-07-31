"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, Loader2, X, ZoomIn } from "lucide-react";

const VIEWPORT = 320; // px, square crop viewport shown on screen
const OUTPUT = 512; // px, final cropped image size

// A dependency-free square image cropper: drag the image to reposition it,
// use the slider to zoom, "Crop & Use" renders exactly what's inside the
// viewport to a canvas and hands back a real File — same shape as what a
// file input gives you, so it drops straight into an existing upload flow.
//
// Reads the picked file via FileReader -> data URL rather than
// URL.createObjectURL()'s blob: URL. Object URLs are usually fine, but in
// some browser privacy modes / extensions / edge-CDN setups they can
// silently fail to render — the <img> just never loads, with no error,
// which looks exactly like a blank black box. Data URLs don't have that
// failure mode.
export default function ImageCropModal({ file, onCancel, onCropped }) {
  const [imgEl, setImgEl] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [baseScale, setBaseScale] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    setLoadError(null);
    setImgEl(null);

    const reader = new FileReader();

    reader.onload = () => {
      if (cancelled) return;
      const img = new Image();
      img.onload = () => {
        if (cancelled) return;
        // "Cover" the viewport so there's never empty space around the crop.
        const scale = Math.max(VIEWPORT / img.width, VIEWPORT / img.height);
        setBaseScale(scale);
        setZoom(1);
        setOffset({
          x: (VIEWPORT - img.width * scale) / 2,
          y: (VIEWPORT - img.height * scale) / 2,
        });
        setImgEl(img);
      };
      img.onerror = () => {
        if (!cancelled) setLoadError("Couldn't read that image — try a different file.");
      };
      img.src = reader.result;
    };
    reader.onerror = () => {
      if (!cancelled) setLoadError("Couldn't read that image — try a different file.");
    };
    reader.readAsDataURL(file);

    return () => {
      cancelled = true;
    };
  }, [file]);

  const scale = baseScale * zoom;

  function clampOffset(o, sc) {
    if (!imgEl) return o;
    const w = imgEl.width * sc;
    const h = imgEl.height * sc;
    const minX = Math.min(0, VIEWPORT - w);
    const minY = Math.min(0, VIEWPORT - h);
    return {
      x: Math.min(0, Math.max(minX, o.x)),
      y: Math.min(0, Math.max(minY, o.y)),
    };
  }

  function startDrag(clientX, clientY) {
    dragRef.current = { startX: clientX, startY: clientY, startOffset: offset };
  }
  function moveDrag(clientX, clientY) {
    if (!dragRef.current) return;
    const dx = clientX - dragRef.current.startX;
    const dy = clientY - dragRef.current.startY;
    const next = {
      x: dragRef.current.startOffset.x + dx,
      y: dragRef.current.startOffset.y + dy,
    };
    setOffset(clampOffset(next, scale));
  }
  function endDrag() {
    dragRef.current = null;
  }

  function handleZoomChange(e) {
    const newZoom = Number(e.target.value);
    const newScale = baseScale * newZoom;
    setZoom(newZoom);
    setOffset((o) => clampOffset(o, newScale));
  }

  function handleConfirm() {
    if (!imgEl) return;
    setProcessing(true);

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    const ctx = canvas.getContext("2d");

    // Map the visible viewport window back into the original image's
    // coordinate space, accounting for the current pan/zoom.
    const sx = -offset.x / scale;
    const sy = -offset.y / scale;
    const sSize = VIEWPORT / scale;

    ctx.drawImage(imgEl, sx, sy, sSize, sSize, 0, 0, OUTPUT, OUTPUT);

    canvas.toBlob(
      (blob) => {
        setProcessing(false);
        if (!blob) return;
        const croppedFile = new File([blob], file.name || "cropped.jpg", {
          type: "image/jpeg",
        });
        onCropped(croppedFile);
      },
      "image/jpeg",
      0.9
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-graphite-700 bg-graphite-900 p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-white">Crop photo</h3>
          <button onClick={onCancel} className="text-graphite-500 hover:text-white" aria-label="Cancel">
            <X size={18} />
          </button>
        </div>

        <div
          className="relative mx-auto overflow-hidden rounded-lg bg-graphite-950 ring-1 ring-graphite-700"
          style={{ width: VIEWPORT, height: VIEWPORT, touchAction: "none" }}
          onMouseDown={(e) => imgEl && startDrag(e.clientX, e.clientY)}
          onMouseMove={(e) => dragRef.current && moveDrag(e.clientX, e.clientY)}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onTouchStart={(e) => imgEl && startDrag(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchMove={(e) => {
            if (dragRef.current) {
              e.preventDefault();
              moveDrag(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          onTouchEnd={endDrag}
        >
          {imgEl && (
            <img
              src={imgEl.src}
              alt=""
              draggable={false}
              className="absolute cursor-grab select-none active:cursor-grabbing"
              style={{
                width: imgEl.width * scale,
                height: imgEl.height * scale,
                left: offset.x,
                top: offset.y,
              }}
            />
          )}

          {!imgEl && !loadError && (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-graphite-500">
              <Loader2 size={22} className="animate-spin" />
              <p className="text-xs">Loading photo…</p>
            </div>
          )}

          {loadError && (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-6 text-center text-signal-red">
              <AlertTriangle size={22} />
              <p className="text-xs">{loadError}</p>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <ZoomIn size={14} className="shrink-0 text-graphite-500" />
          <input
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={zoom}
            onChange={handleZoomChange}
            disabled={!imgEl}
            className="w-full accent-trace-500 disabled:opacity-40"
          />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-graphite-700 px-4 py-2 text-sm font-medium text-graphite-300 hover:bg-graphite-800"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!imgEl || processing}
            className="flex items-center gap-1.5 rounded-lg bg-trace-500 px-4 py-2 text-sm font-semibold text-graphite-950 transition hover:bg-trace-400 disabled:opacity-60"
          >
            <Check size={15} />
            {processing ? "Cropping…" : "Crop & Use"}
          </button>
        </div>
      </div>
    </div>
  );
}