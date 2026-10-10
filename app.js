/* ============================================
   WIPE LAYER GENERATOR — APPLICATION LOGIC
   Alight Motion XML Export · Full-Screen Wipe Masking
   ============================================ */

(() => {
  'use strict';

  // Alight Motion can round independently scaled, fractional-pixel shapes in a
  // way that reveals the transparent canvas between two edge-to-edge tiles.
  // Expand each mask tile by this amount on every edge so adjacent tiles overlap.
  const MASK_SEAM_OVERSCAN_PX = 2;
  // The same rounding issue applies to the normalized ranges used by the Wipe
  // effect. This is converted to a fraction of the solid for each axis.
  const WIPE_SEAM_OVERSCAN_PX = 2;

  // ---- State ----
  const state = {
    baseWidth: 1080,
    baseHeight: 1350,
    projectWidth: 1080,
    projectHeight: 1350,
    solidWidth: 1080,
    solidHeight: 1350,
    splitDirection: 'horizontal',
    wipeMethod: 'mask', // 'wipe' or 'mask' (Masking Mode enabled)
    maskEmbedScene: true, // Group in <embedScene> matching Project Name 294
    videoLayer: false,
    videoUri: 'am-internal:///4BA32805414BE561BE374FA7D5B88C4BF8261057.MP4',
    videoDurationMs: 10450,
    solidColor: '#64E4DC',
    wipeAngle: 0,
    wipeSoftness: 0,
    aspectLocked: true,
    projectDurationStr: '00:05:00',
    fps: 60,
    beat1Str: '00:00:00',
    beat2Str: '00:02:00',
    beat3Str: '00:04:00',
    sectionCount: 1,
    sections: [
      { 
        subSectionCount: 1,
        moveEnabled: false,
        moveMode: 'preset',
        movePreset: 'left',
        moveTransitionType: 'in',
        moveDistance: 1080,
        moveStartX: 0,
        moveStartY: 675,
        moveEndX: 540,
        moveEndY: 675,
        moveCustomEasing: false,
        moveEasing: '0.345870, 0.0, 0.188790, 1.0',
        subSections: [
          {
            layerCount: 5,
            splitDirection: 'global',
            customPivot: false,
            pivotX: 0,
            pivotY: 0,
            animOrder: 'topDown', 
            startAngle: 0, 
            endAngle: 90, 
            axis: 0, 
            cubeXStart: 0,
            cubeXEnd: 0,
            cubeYStart: 0,
            cubeYEnd: 0,
            cubeZStart: 0,
            cubeZEnd: 0,
            customEasing: false, 
            easing: '0.25, 0.10, 0.25, 1.00',
            customTiming: false,
            beat1Str: '00:00:00',
            beat2Str: '00:02:00',
            beat3Str: '00:04:00'
          }
        ]
      }
    ],
    animType: 'flip', // 'none', 'flip', 'cube', 'box'
    flipPivotX: 0,
    flipPivotY: 0,
    box: {
      orientAllStartStr: '00:00:00',
      orientFirstEndStr: '00:02:00',
      orientLastEndStr: '00:04:00',
      orientStartX: 0,
      orientStartY: 0,
      orientStartZ: 0,
      orientEndX: 0,
      orientEndY: 180,
      orientEndZ: 0,
      rotateAllStartStr: '00:01:00',
      rotateFirstEndStr: '00:03:00',
      rotateLastEndStr: '00:05:00',
      rotateStartX: 0,
      rotateStartY: 0,
      rotateStartZ: 0,
      rotateEndX: 0,
      rotateEndY: 180,
      rotateEndZ: 0,
      depth: 0.01,
      scale: 3.51,
      orientEasing: '0.25, 0.10, 0.25, 1.00',
      rotateEasing: '0.25, 0.10, 0.25, 1.00',
    },
    flipEasing: '0.79, 0.00, 0.59, 1.00',
    isPlaying: false,
    currentTimeSec: 0,
  };

  // ---- DOM References ----
  const $ = (sel) => document.querySelector(sel);
  const canvas = $('#previewCanvas');
  const ctx = canvas.getContext('2d');

  // Controls
  const wipeMethodToggleGroup = $('#wipeMethodToggle');
  const maskingOptions = $('#maskingOptions');
  const preset45Fit = $('#preset45Fit');
  const preset45Full = $('#preset45Full');
  const maskGroupToggle = $('#maskGroupToggle');
  const slicingBadge = $('#slicingBadge');
  const hudSlice = $('#hudSlice');
  const thCol4 = $('#thCol4');
  const thCol5 = $('#thCol5');
  const thCol6 = $('#thCol6');
  const splitDirectionGroup = $('#splitDirection');
  const videoLayerToggle = $('#videoLayerToggle');
  const videoLayerControls = $('#videoLayerControls');
  const videoUriInput = $('#videoUri');
  const videoDurationInput = $('#videoDurationMs');
  const projectScaleSelect = $('#projectScale');
  const solidWidthInput = $('#solidWidth');
  const solidHeightInput = $('#solidHeight');
  const aspectLinkBtn = $('#aspectLinkBtn');
  const aspectHint = $('#aspectHint');
  const solidColorInput = $('#solidColor');
  const colorValueSpan = $('#colorValue');
  const wipeAngleInput = $('#wipeAngle');
  const wipeAngleValue = $('#wipeAngleValue');
  const wipeSoftnessInput = $('#wipeSoftness');
  const wipeSoftnessValue = $('#wipeSoftnessValue');

  // Animation & Timing
  const projectDurationInput = $('#projectDuration');
  const projectFpsInput = $('#projectFps');
  const globalTimingControls = $('#globalTimingControls');
  const beat1Input = $('#beat1');
  const beat2Input = $('#beat2');
  const beat3Input = $('#beat3');
  const animTypeToggleGroup = $('#animTypeToggle');
  const flipPivotXInput = $('#flipPivotX');
  const flipPivotYInput = $('#flipPivotY');

  // Box Controls
  const boxEffectControls = $('#boxEffectControls');
  const boxOrientAllStartInput = $('#boxOrientAllStart');
  const boxOrientFirstEndInput = $('#boxOrientFirstEnd');
  const boxOrientLastEndInput = $('#boxOrientLastEnd');
  const boxOrientStartXInput = $('#boxOrientStartX');
  const boxOrientStartYInput = $('#boxOrientStartY');
  const boxOrientStartZInput = $('#boxOrientStartZ');
  const boxOrientEndXInput = $('#boxOrientEndX');
  const boxOrientEndYInput = $('#boxOrientEndY');
  const boxOrientEndZInput = $('#boxOrientEndZ');
  const boxRotateAllStartInput = $('#boxRotateAllStart');
  const boxRotateFirstEndInput = $('#boxRotateFirstEnd');
  const boxRotateLastEndInput = $('#boxRotateLastEnd');
  const boxRotateStartXInput = $('#boxRotateStartX');
  const boxRotateStartYInput = $('#boxRotateStartY');
  const boxRotateStartZInput = $('#boxRotateStartZ');
  const boxRotateEndXInput = $('#boxRotateEndX');
  const boxRotateEndYInput = $('#boxRotateEndY');
  const boxRotateEndZInput = $('#boxRotateEndZ');
  const boxOrientEasingBtn = $('#boxOrientEasingBtn');
  const boxRotateEasingBtn = $('#boxRotateEasingBtn');
  
  const sectionCountInput = $('#sectionCount');
  const sectionMinusBtn = $('#sectionMinus');
  const sectionPlusBtn = $('#sectionPlus');
  const sectionsContainer = $('#sectionsContainer');
  
  const openGraphBtn = $('#openGraphBtn');
  const closeGraphBtn = $('#closeGraphBtn');
  const graphModal = $('#graphModal');
  const graphIframe = $('#graphIframe');
  const graphIframe2 = $('#graphIframe2');

  // Display
  const wipeXDisplay = $('#wipeXDisplay');
  const wipeYDisplay = $('#wipeYDisplay');
  const previewDimensions = $('#previewDimensions');
  const crosshairLabel = $('#crosshairLabel');
  const formulaContent = $('#formulaContent');
  const xmlCode = $('#xmlCode');
  
  // Playback
  const playBtn = $('#playBtn');
  const playIcon = $('#playIcon');
  const playbackScrubber = $('#playbackScrubber');
  const playbackTimeDisplay = $('#playbackTimeDisplay');

  // Buttons
  const toggleXmlBtn = $('#toggleXmlBtn');
  const copyXmlBtn = $('#copyXmlBtn');
  const downloadXmlBtn = $('#downloadXmlBtn');
  const copySettingsBtn = $('#copySettingsBtn');
  const importSettingsBtn = $('#importSettingsBtn');
  const xmlCodeContainer = $('#xmlCodeContainer');

  // Toast
  const toast = $('#toast');
  const toastMessage = $('#toastMessage');

  // ---- Utility Functions ----
  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  function getLayerColor(index, total, sectionIdx = 0, sCount = 1) {
    const { r, g, b } = hexToRgb(state.solidColor);
    const { h, s, l } = rgbToHsl(r, g, b);
    const range = Math.min(20, 40 / total);
    const offset = (index / Math.max(1, total - 1) - 0.5) * range;
    const newL = Math.max(10, Math.min(90, l + offset));
    
    let newH = h;
    if (sCount > 1) {
      newH = (h + (sectionIdx * (360 / sCount))) % 360;
    }
    
    return `hsl(${newH}, ${s}%, ${newL}%)`;
  }

  function bezierY(t, x1, y1, x2, y2) {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    function sampleX(u) { return ((ax * u + bx) * u + cx) * u; }
    function sampleY(u) { return ((ay * u + by) * u + cy) * u; }
    function derivX(u) { return (3 * ax * u + 2 * bx) * u + cx; }
    let u = t;
    for (let i = 0; i < 8; i++) {
      const xErr = sampleX(u) - t;
      if (Math.abs(xErr) < 1e-6) break;
      const d = Math.abs(derivX(u)) < 1e-6 ? 1e-6 : derivX(u);
      u -= xErr / d;
    }
    return sampleY(Math.max(0, Math.min(1, u)));
  }

  function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2200);
  }

  function eulerToQuaternion(x, y, z) {
    // Convert degrees to radians
    const radX = x * Math.PI / 180;
    const radY = y * Math.PI / 180;
    const radZ = z * Math.PI / 180;

    const cy = Math.cos(radZ * 0.5);
    const sy = Math.sin(radZ * 0.5);
    const cp = Math.cos(radY * 0.5);
    const sp = Math.sin(radY * 0.5);
    const cr = Math.cos(radX * 0.5);
    const sr = Math.sin(radX * 0.5);

    const w = cr * cp * cy + sr * sp * sy;
    const x_q = sr * cp * cy - cr * sp * sy;
    const y_q = cr * sp * cy + sr * cp * sy;
    const z_q = cr * cp * sy - sr * sp * cy;

    return { w, x: x_q, y: y_q, z: z_q };
  }

  function escapeXmlAttr(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function parseTimeToSeconds(timeStr) {
    // Format: MM:SS:FF where FF = frame number (0 to fps-1)
    const parts = timeStr.split(':');
    let m = 0, s = 0, f = 0;
    if (parts.length === 3) {
      m = parseInt(parts[0]) || 0;
      s = parseInt(parts[1]) || 0;
      f = parseInt(parts[2]) || 0;
    } else if (parts.length === 2) {
      s = parseInt(parts[0]) || 0;
      f = parseInt(parts[1]) || 0;
    } else {
      s = parseFloat(timeStr) || 0;
      return s;
    }
    return m * 60 + s + (f / state.fps);
  }

  // ---- Layer Calculation ----
  function calculateLayers() {
    const layers = [];
    const sCount = state.sectionCount;

    const globalB1 = parseTimeToSeconds(state.beat1Str);
    const globalB2 = parseTimeToSeconds(state.beat2Str);
    const globalB3 = parseTimeToSeconds(state.beat3Str);

    let globalLayerIndex = 0;

    for (let s = 0; s < sCount; s++) {
      const sec = state.sections[s];
      
      let secXStart = 0, secXEnd = 1, secYStart = 0, secYEnd = 1;
      if (state.splitDirection === 'horizontal') {
        secYStart = s / sCount;
        secYEnd = (s + 1) / sCount;
      } else {
        secXStart = s / sCount;
        secXEnd = (s + 1) / sCount;
      }

      const subCount = sec.subSections ? sec.subSections.length : 1;
      
      for (let sub = 0; sub < subCount; sub++) {
        const subSec = sec.subSections ? sec.subSections[sub] : sec;
        const subLayerCount = subSec.layerCount || 1;
        
        const subPivotX = subSec.customPivot ? (subSec.pivotX !== undefined ? subSec.pivotX : 0) : state.flipPivotX;
        const subPivotY = subSec.customPivot ? (subSec.pivotY !== undefined ? subSec.pivotY : 0) : state.flipPivotY;
        
        let subXStart = secXStart, subXEnd = secXEnd, subYStart = secYStart, subYEnd = secYEnd;
        
        if (state.splitDirection === 'horizontal') {
          const secYRange = secYEnd - secYStart;
          subYStart = secYStart + (sub / subCount) * secYRange;
          subYEnd = secYStart + ((sub + 1) / subCount) * secYRange;
        } else {
          const secXRange = secXEnd - secXStart;
          subXStart = secXStart + (sub / subCount) * secXRange;
          subXEnd = secXStart + ((sub + 1) / subCount) * secXRange;
        }

        const b1 = subSec.customTiming ? parseTimeToSeconds(subSec.beat1Str) : globalB1;
          const b2 = subSec.customTiming ? parseTimeToSeconds(subSec.beat2Str) : globalB2;
          const b3 = subSec.customTiming ? parseTimeToSeconds(subSec.beat3Str) : globalB3;

          const subDir = (subSec.splitDirection && subSec.splitDirection !== 'global') ? subSec.splitDirection : state.splitDirection;

        for (let l = 0; l < subLayerCount; l++) {
          let layerXStart = subXStart, layerXEnd = subXEnd, layerYStart = subYStart, layerYEnd = subYEnd;
          
          if (subDir === 'horizontal') {
            const subYRange = subYEnd - subYStart;
            layerYStart = subYStart + (l / subLayerCount) * subYRange;
            layerYEnd = subYStart + ((l + 1) / subLayerCount) * subYRange;
          } else {
            const subXRange = subXEnd - subXStart;
            layerXStart = subXStart + (l / subLayerCount) * subXRange;
            layerXEnd = subXStart + ((l + 1) / subLayerCount) * subXRange;
          }

          let localOrderIdx = l;
          if (subSec.animOrder === 'bottomUp') {
            localOrderIdx = subLayerCount - 1 - l;
          }

          const staggerRatio = (subLayerCount > 1) ? (localOrderIdx / (subLayerCount - 1)) : 0;
          const flipEnd = b2 + (b3 - b2) * staggerRatio;

          const orientAllStart = parseTimeToSeconds(state.box.orientAllStartStr);
          const orientFirstEnd = parseTimeToSeconds(state.box.orientFirstEndStr);
          const orientLastEnd = parseTimeToSeconds(state.box.orientLastEndStr);
          const orientStart = orientAllStart;
          const orientEnd = orientFirstEnd + (orientLastEnd - orientFirstEnd) * staggerRatio;

          const rotateAllStart = parseTimeToSeconds(state.box.rotateAllStartStr);
          const rotateFirstEnd = parseTimeToSeconds(state.box.rotateFirstEndStr);
          const rotateLastEnd = parseTimeToSeconds(state.box.rotateLastEndStr);
          const rotateStart = rotateAllStart;
          const rotateEnd = rotateFirstEnd + (rotateLastEnd - rotateFirstEnd) * staggerRatio;

          const layerProps = {
            index: globalLayerIndex + 1,
            flipStartT: b1,
            flipEndT: flipEnd,
            orientStartT: orientStart,
            orientEndT: orientEnd,
            rotateStartT: rotateStart,
            rotateEndT: rotateEnd,
            flipStartAngle: subSec.startAngle,
            flipEndAngle: subSec.endAngle,
            flipAxis: subSec.axis,
            cubeXStart: subSec.cubeXStart || 0,
            cubeXEnd: subSec.cubeXEnd || 0,
            cubeYStart: subSec.cubeYStart || 0,
            cubeYEnd: subSec.cubeYEnd || 0,
            cubeZStart: subSec.cubeZStart || 0,
            cubeZEnd: subSec.cubeZEnd || 0,
            pivotX: subPivotX,
            pivotY: subPivotY,
            sectionIdx: s,
            subSectionIdx: sub,
            flipEasing: subSec.customEasing ? subSec.easing : state.flipEasing
          };

          if (state.wipeMethod === 'mask') {
            const tileWidth = (layerXEnd - layerXStart) * state.solidWidth;
            const tileHeight = (layerYEnd - layerYStart) * state.solidHeight;
            // Keep the tile's calculated center, but extend all four edges by
            // two pixels. A shared edge therefore has a four-pixel overlap,
            // eliminating anti-aliasing/rounding seams in the imported XML.
            const layerWidth = tileWidth + (MASK_SEAM_OVERSCAN_PX * 2);
            const layerHeight = tileHeight + (MASK_SEAM_OVERSCAN_PX * 2);
            const solidOriginX = (state.projectWidth - state.solidWidth) / 2;
            const solidOriginY = (state.projectHeight - state.solidHeight) / 2;
            const layerLocX = solidOriginX + (layerXStart * state.solidWidth) + (tileWidth / 2);
            const layerLocY = solidOriginY + (layerYStart * state.solidHeight) + (tileHeight / 2);

            Object.assign(layerProps, {
              locX: layerLocX,
              locY: layerLocY,
              width: layerWidth,
              height: layerHeight,
              wipeXStart: 0,
              wipeXEnd: 1,
              wipeYStart: 0,
              wipeYEnd: 1,
            });
          } else { // 'wipe' method
            // Wipe ranges are normalized (0–1). Expand them by two physical
            // pixels on each edge so Alight Motion cannot expose a transparent
            // seam where two independently rendered Wipe effects meet.
            const wipeOverscanX = WIPE_SEAM_OVERSCAN_PX / state.solidWidth;
            const wipeOverscanY = WIPE_SEAM_OVERSCAN_PX / state.solidHeight;
            Object.assign(layerProps, {
              locX: state.projectWidth / 2,
              locY: state.projectHeight / 2,
              width: state.solidWidth,
              height: state.solidHeight,
              wipeXStart: Math.max(0, layerXStart - wipeOverscanX),
              wipeXEnd: Math.min(1, layerXEnd + wipeOverscanX),
              wipeYStart: Math.max(0, layerYStart - wipeOverscanY),
              wipeYEnd: Math.min(1, layerYEnd + wipeOverscanY),
            });
          }

          // Move & Transform Transition Calculation
          const baseX = layerProps.locX;
          const baseY = layerProps.locY;
          const moveEnabled = !!sec.moveEnabled;
          let moveStartX = baseX;
          let moveStartY = baseY;
          let moveEndX = baseX;
          let moveEndY = baseY;

          if (moveEnabled) {
            const moveMode = sec.moveMode || 'preset';
            if (moveMode === 'preset') {
              const preset = sec.movePreset || 'left';
              const flow = sec.moveTransitionType || 'in';
              const defaultDist = (preset === 'up' || preset === 'down') ? state.projectHeight : state.projectWidth;
              const dist = (sec.moveDistance !== undefined && !isNaN(sec.moveDistance)) ? parseFloat(sec.moveDistance) : defaultDist;

              if (preset === 'left') {
                if (flow === 'in') {
                  moveStartX = baseX - dist;
                  moveStartY = baseY;
                  moveEndX = baseX;
                  moveEndY = baseY;
                } else {
                  moveStartX = baseX;
                  moveStartY = baseY;
                  moveEndX = baseX - dist;
                  moveEndY = baseY;
                }
              } else if (preset === 'right') {
                if (flow === 'in') {
                  moveStartX = baseX + dist;
                  moveStartY = baseY;
                  moveEndX = baseX;
                  moveEndY = baseY;
                } else {
                  moveStartX = baseX;
                  moveStartY = baseY;
                  moveEndX = baseX + dist;
                  moveEndY = baseY;
                }
              } else if (preset === 'up') {
                if (flow === 'in') {
                  moveStartX = baseX;
                  moveStartY = baseY - dist;
                  moveEndX = baseX;
                  moveEndY = baseY;
                } else {
                  moveStartX = baseX;
                  moveStartY = baseY;
                  moveEndX = baseX;
                  moveEndY = baseY - dist;
                }
              } else if (preset === 'down') {
                if (flow === 'in') {
                  moveStartX = baseX;
                  moveStartY = baseY + dist;
                  moveEndX = baseX;
                  moveEndY = baseY;
                } else {
                  moveStartX = baseX;
                  moveStartY = baseY;
                  moveEndX = baseX;
                  moveEndY = baseY + dist;
                }
              }
            } else { // 'coords' mode
              const customSX = (sec.moveStartX !== undefined && !isNaN(sec.moveStartX)) ? parseFloat(sec.moveStartX) : (state.projectWidth / 2);
              const customSY = (sec.moveStartY !== undefined && !isNaN(sec.moveStartY)) ? parseFloat(sec.moveStartY) : (state.projectHeight / 2);
              const customEX = (sec.moveEndX !== undefined && !isNaN(sec.moveEndX)) ? parseFloat(sec.moveEndX) : (state.projectWidth / 2);
              const customEY = (sec.moveEndY !== undefined && !isNaN(sec.moveEndY)) ? parseFloat(sec.moveEndY) : (state.projectHeight / 2);

              if (state.wipeMethod === 'wipe') {
                moveStartX = customSX;
                moveStartY = customSY;
                moveEndX = customEX;
                moveEndY = customEY;
              } else {
                const centerX = state.projectWidth / 2;
                const centerY = state.projectHeight / 2;
                moveStartX = baseX + (customSX - centerX);
                moveStartY = baseY + (customSY - centerY);
                moveEndX = baseX + (customEX - centerX);
                moveEndY = baseY + (customEY - centerY);
              }
            }
          }

          Object.assign(layerProps, {
            moveEnabled,
            moveStartX,
            moveStartY,
            moveEndX,
            moveEndY,
            moveEasing: sec.moveCustomEasing ? (sec.moveEasing || '0.345870, 0.0, 0.188790, 1.0') : state.flipEasing
          });

          layers.push(layerProps);
          
          globalLayerIndex++;
        }
      }
    }
    return layers;
  }

  // ---- Canvas Rendering ----
  function renderPreview(timeSec = state.currentTimeSec) {
    const container = $('#canvasContainer');
    const maxW = container.clientWidth - 48;
    const maxH = container.clientHeight - 48;

    const ratio = state.projectWidth / state.projectHeight;
    let drawW, drawH;
    if (maxW / maxH > ratio) {
      drawH = Math.min(maxH, 500);
      drawW = drawH * ratio;
    } else {
      drawW = Math.min(maxW, 400);
      drawH = drawW / ratio;
    }

    canvas.style.width = drawW + 'px';
    canvas.style.height = drawH + 'px';

    const dpr = window.devicePixelRatio || 1;
    canvas.width = drawW * dpr;
    canvas.height = drawH * dpr;
    ctx.scale(dpr, dpr);

    const scaleF = drawW / state.projectWidth;
    const layers = calculateLayers();

    // Clear
    ctx.clearRect(0, 0, drawW, drawH);

    // Draw each layer
    layers.forEach((layer, idx) => {
      ctx.save();

      let eased = 0;
      if ((state.animType === 'flip' || state.animType === 'cube') && timeSec > layer.flipStartT) {
        if (timeSec >= layer.flipEndT) {
          eased = 1;
        } else {
          const progress = (timeSec - layer.flipStartT) / (layer.flipEndT - layer.flipStartT);
          const [x1, y1, x2, y2] = layer.flipEasing.split(',').map(Number);
          eased = bezierY(progress, x1, y1, x2, y2);
        }
      }

      let flipAngle = layer.flipStartAngle + (layer.flipEndAngle - layer.flipStartAngle) * eased;
      let cubeRotX = layer.cubeXStart + (layer.cubeXEnd - layer.cubeXStart) * eased;
      let cubeRotY = layer.cubeYStart + (layer.cubeYEnd - layer.cubeYStart) * eased;
      let cubeRotZ = layer.cubeZStart + (layer.cubeZEnd - layer.cubeZStart) * eased;

      let moveEased = 0;
      if (layer.moveEnabled && timeSec > layer.flipStartT) {
        if (timeSec >= layer.flipEndT) {
          moveEased = 1;
        } else {
          const progress = (timeSec - layer.flipStartT) / (layer.flipEndT - layer.flipStartT);
          const [mx1, my1, mx2, my2] = layer.moveEasing.replace(/,/g, ' ').trim().split(/\s+/).map(Number);
          moveEased = bezierY(progress, mx1, my1, mx2, my2);
        }
      }

      let currentLocX = layer.locX;
      let currentLocY = layer.locY;
      if (layer.moveEnabled) {
        currentLocX = layer.moveStartX + (layer.moveEndX - layer.moveStartX) * moveEased;
        currentLocY = layer.moveStartY + (layer.moveEndY - layer.moveStartY) * moveEased;
      }

      const layerW = layer.width * scaleF;
      const layerH = layer.height * scaleF;
      const layerLeft = (currentLocX * scaleF) - (layerW / 2);
      const layerTop = (currentLocY * scaleF) - (layerH / 2);

      // --- 3D FLIP/CUBE EMULATION ---
      if (state.animType === 'flip' || state.animType === 'cube' || state.animType === 'box') {
        // The Cube effect always rotates around the layer's center (pivot is
        // not exported for cube2), so ignore the flip pivot for the cube preview.
        const normPivotX = state.animType === 'cube' ? 0.5 : (layer.pivotX / 200) + 0.5;
        const normPivotY = state.animType === 'cube' ? 0.5 : (layer.pivotY / 200) + 0.5;
        const px = layerLeft + (normPivotX * layerW);
        const py = layerTop + (normPivotY * layerH);
        
        ctx.translate(px, py);
        
        if (state.animType === 'flip') {
          const axisRad = (layer.flipAxis * Math.PI) / 180;
          ctx.rotate(-axisRad);
          const flipRad = (flipAngle * Math.PI) / 180;
          ctx.scale(Math.cos(flipRad), 1);
          ctx.rotate(axisRad);
        } else if (state.animType === 'cube') {
          // True 3D rotation projected orthographically onto the canvas:
          //   X = tilt up/down (foreshortens vertically)
          //   Y = turn left/right (foreshortens horizontally)
          //   Z = spin on the 2D plane
          // Canvas space: +x right, +y down, +z into the screen.
          const rx = (cubeRotX * Math.PI) / 180;
          const ry = (cubeRotY * Math.PI) / 180;
          const rz = (cubeRotZ * Math.PI) / 180;
          const cx = Math.cos(rx), sx = Math.sin(rx);
          const cy = Math.cos(ry), sy = Math.sin(ry);
          const cz = Math.cos(rz), sz = Math.sin(rz);
          // M = Rz * Ry * Rx. The face lies on z = 0, so only the first two
          // columns (images of the x and y unit vectors) matter.
          // Column for unit X:
          const m00 = cz * cy;
          const m10 = sz * cy;
          // Column for unit Y:
          const m01 = cz * sy * sx - sz * cx;
          const m11 = sz * sy * sx + cz * cx;
          ctx.transform(m00, m10, m01, m11, 0, 0);
        } else if (state.animType === 'box') {
            // Orientation progress
            let orientEased = 0;
            const orientStartT = layer.orientStartT;
            const orientEndT = layer.orientEndT;
            if (timeSec > orientStartT && orientEndT > orientStartT) {
                if (timeSec >= orientEndT) {
                    orientEased = 1;
                } else {
                    const progress = (timeSec - orientStartT) / (orientEndT - orientStartT);
                    const [x1, y1, x2, y2] = state.box.orientEasing.split(',').map(Number);
                    orientEased = bezierY(progress, x1, y1, x2, y2);
                }
            }

            // Rotation progress
            let rotateEased = 0;
            const rotateStartT = layer.rotateStartT;
            const rotateEndT = layer.rotateEndT;
            if (timeSec > rotateStartT && rotateEndT > rotateStartT) {
                if (timeSec >= rotateEndT) {
                    rotateEased = 1;
                } else {
                    const progress = (timeSec - rotateStartT) / (rotateEndT - rotateStartT);
                    const [x1, y1, x2, y2] = state.box.rotateEasing.split(',').map(Number);
                    rotateEased = bezierY(progress, x1, y1, x2, y2);
                }
            }

            // Interpolate angles
            const orientRotX = state.box.orientStartX + (state.box.orientEndX - state.box.orientStartX) * orientEased;
            const orientRotY = state.box.orientStartY + (state.box.orientEndY - state.box.orientStartY) * orientEased;
            
            const rotateRotX = state.box.rotateStartX + (state.box.rotateEndX - state.box.rotateStartX) * rotateEased;
            const rotateRotY = state.box.rotateStartY + (state.box.rotateEndY - state.box.rotateStartY) * rotateEased;

            // Combine rotations for 2D preview (simplification)
            const combinedRotX = orientRotX + rotateRotX;
            const combinedRotY = orientRotY + rotateRotY;

            // Apply transformation (similar to cube)
            const radX = (combinedRotX * Math.PI) / 180;
            const radY = (combinedRotY * Math.PI) / 180;
            ctx.scale(Math.cos(radY), Math.cos(radX));
        }
        
        ctx.translate(-px, -py);
      }

      if (state.wipeMethod === 'wipe') {
        const solidW = state.solidWidth * scaleF;
        const solidH = state.solidHeight * scaleF;
        const solidLeft = (currentLocX * scaleF) - (solidW / 2);
        const solidTop = (currentLocY * scaleF) - (solidH / 2);

        const lx = solidLeft + layer.wipeXStart * solidW;
        const lw = (layer.wipeXEnd - layer.wipeXStart) * solidW;
        const ly = solidTop + layer.wipeYStart * solidH;
        const lh = (layer.wipeYEnd - layer.wipeYStart) * solidH;

        ctx.beginPath();
        ctx.rect(lx, ly, lw, lh);
        ctx.clip();

        ctx.fillStyle = getLayerColor(idx, layers.length, layer.sectionIdx, state.sectionCount);
        ctx.fillRect(solidLeft, solidTop, solidW, solidH);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = `${Math.max(9, 12 * scaleF * 3)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`C${layer.index}`, lx + lw / 2, ly + lh / 2);

      } else { // 'mask' method
        ctx.fillStyle = getLayerColor(idx, layers.length, layer.sectionIdx, state.sectionCount);
        ctx.fillRect(layerLeft, layerTop, layerW, layerH);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = `${Math.max(9, 12 * scaleF * 3)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`C${layer.index}`, layerLeft + layerW / 2, layerTop + layerH / 2);
      }

      ctx.restore();
    });

    // Draw grid lines between layers
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    layers.forEach((layer) => {
      const layerW = layer.width * scaleF;
      const layerH = layer.height * scaleF;
      const layerLeft = (layer.locX * scaleF) - (layerW / 2);
      const layerTop = (layer.locY * scaleF) - (layerH / 2);
      ctx.strokeRect(layerLeft, layerTop, layerW, layerH);
    });

    ctx.setLineDash([]);

    // Draw central crosshair
    const cx = (state.projectWidth / 2) * scaleF;
    const cy = (state.projectHeight / 2) * scaleF;
    const crossSize = 12;

    ctx.strokeStyle = 'rgba(163, 230, 53, 0.85)';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(cx - crossSize, cy);
    ctx.lineTo(cx + crossSize, cy);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx, cy - crossSize);
    ctx.lineTo(cx, cy + crossSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.stroke();

    // Draw border for canvas
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, drawW - 1, drawH - 1);
  }

  function renderSectionsUI() {
    const container = $('#sectionsContainer');
    let html = '';
    const sCount = state.sectionCount;

    for (let i = 0; i < sCount; i++) {
      const sec = state.sections[i];
      const subCount = sec.subSections ? sec.subSections.length : 1;
      
      html += `
        <div class="section-block" data-index="${i}">
          <div class="section-header">
            <span class="sec-num">S${i + 1}</span>
            Section ${i + 1}
          </div>
          
          <div class="control-group">
            <label>Sub-sections</label>
            <div class="stepper-input">
              <button class="stepper-btn sec-sub-minus">−</button>
              <input type="number" class="sec-sub-count" min="1" max="10" value="${subCount}">
              <button class="stepper-btn sec-sub-plus">+</button>
            </div>
          </div>

          <!-- Move & Transform Transition Switch & Controls -->
          <div class="control-group">
            <label>
              Move &amp; Transform
              <span class="badge">KEYFRAMES</span>
            </label>
            <div class="toggle-group sec-move-toggle">
              <button class="toggle-btn ${sec.moveEnabled ? 'active' : ''}" data-value="on">On</button>
              <button class="toggle-btn ${!sec.moveEnabled ? 'active' : ''}" data-value="off">Off</button>
            </div>
            <div class="control-hint">Animate position coordinates for this section</div>
          </div>

          <div class="sec-move-box" style="display: ${sec.moveEnabled ? 'block' : 'none'};">
            
            <div class="control-group">
              <label>Position Mode</label>
              <div class="toggle-group sec-move-mode-toggle">
                <button class="toggle-btn ${(sec.moveMode || 'preset') === 'preset' ? 'active' : ''}" data-value="preset">Preset Direction</button>
                <button class="toggle-btn ${sec.moveMode === 'coords' ? 'active' : ''}" data-value="coords">Coordinates (X, Y)</button>
              </div>
            </div>

            <div class="sec-move-preset-fields" style="display: ${(sec.moveMode || 'preset') === 'preset' ? 'block' : 'none'};">
              <div class="control-group">
                <label>Direction</label>
                <select class="sec-move-direction-select">
                  <option value="left" ${(sec.movePreset || 'left') === 'left' ? 'selected' : ''}>Left</option>
                  <option value="right" ${sec.movePreset === 'right' ? 'selected' : ''}>Right</option>
                  <option value="up" ${sec.movePreset === 'up' ? 'selected' : ''}>Up (Top)</option>
                  <option value="down" ${sec.movePreset === 'down' ? 'selected' : ''}>Down (Bottom)</option>
                </select>
              </div>

              <div class="control-group">
                <label>Transition Flow</label>
                <select class="sec-move-flow-select">
                  <option value="in" ${(sec.moveTransitionType || 'in') === 'in' ? 'selected' : ''}>Slide In (Enter into place)</option>
                  <option value="out" ${sec.moveTransitionType === 'out' ? 'selected' : ''}>Slide Out (Exit off screen)</option>
                </select>
              </div>

              <div class="control-group">
                <label>Travel Distance</label>
                <div class="input-group">
                  <input type="number" class="sec-move-distance" value="${sec.moveDistance !== undefined ? sec.moveDistance : (sec.movePreset === 'up' || sec.movePreset === 'down' ? state.projectHeight : state.projectWidth)}" step="10">
                  <div class="input-suffix">PX</div>
                </div>
              </div>
            </div>

            <div class="sec-move-coords-fields" style="display: ${sec.moveMode === 'coords' ? 'block' : 'none'};">
              <div class="control-group">
                <label>Start Position (X, Y)</label>
                <div class="solid-size-row">
                  <div class="input-group" style="flex:1">
                    <input type="number" class="sec-move-start-x" value="${sec.moveStartX !== undefined ? sec.moveStartX : 0}" step="1">
                    <div class="input-suffix">X</div>
                  </div>
                  <div class="input-group" style="flex:1">
                    <input type="number" class="sec-move-start-y" value="${sec.moveStartY !== undefined ? sec.moveStartY : (state.projectHeight / 2)}" step="1">
                    <div class="input-suffix">Y</div>
                  </div>
                </div>
              </div>

              <div class="control-group">
                <label>End Position (X, Y)</label>
                <div class="solid-size-row">
                  <div class="input-group" style="flex:1">
                    <input type="number" class="sec-move-end-x" value="${sec.moveEndX !== undefined ? sec.moveEndX : (state.projectWidth / 2)}" step="1">
                    <div class="input-suffix">X</div>
                  </div>
                  <div class="input-group" style="flex:1">
                    <input type="number" class="sec-move-end-y" value="${sec.moveEndY !== undefined ? sec.moveEndY : (state.projectHeight / 2)}" step="1">
                    <div class="input-suffix">Y</div>
                  </div>
                </div>
              </div>

              <div class="control-group">
                <button class="sec-btn-sub sec-move-fill-center-btn" type="button">
                  Snap End to Center (${state.projectWidth / 2}, ${state.projectHeight / 2})
                </button>
              </div>
            </div>

            <div class="control-group" style="margin-top: 12px;">
              <label>Move Easing Curve</label>
              <div class="toggle-group sec-move-easing-toggle">
                <button class="toggle-btn ${sec.moveCustomEasing ? 'active' : ''}" data-value="on">Custom Curve</button>
                <button class="toggle-btn ${!sec.moveCustomEasing ? 'active' : ''}" data-value="off">Global Easing</button>
              </div>
            </div>

            <div class="sec-move-graph-container" style="display: ${sec.moveCustomEasing ? 'block' : 'none'}; margin-top: 8px;">
              <button class="sec-btn-sub sec-move-open-graph-btn" type="button" style="padding: 9px 12px; font-weight: 600; color: var(--text-1);">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                Edit Section Move Graph
              </button>
              <div style="font-size: 10px; font-family: var(--font-mono); color: var(--text-3); text-align: center; margin-top: 6px;">
                Curve: <span class="sec-move-curve-label" style="color: var(--cyan);">${sec.moveEasing || '0.345870, 0.0, 0.188790, 1.0'}</span>
              </div>
            </div>

          </div>
          
          <div class="sub-sections-container" style="margin-top: 14px; padding-left: 14px; border-left: 2px solid var(--border-subtle);">
      `;

      for (let j = 0; j < subCount; j++) {
        const subSec = sec.subSections ? sec.subSections[j] : sec;
        
        html += `
          <div class="sub-section-block" data-sec-index="${i}" data-sub-index="${j}" style="margin-bottom: 16px;">
            <div class="section-header" style="font-size: 0.75rem; color: var(--text-secondary);">Sub-section ${j + 1}</div>
            
            <div class="control-group">
              <label>Custom Pivot</label>
              <div class="toggle-group sub-pivot-toggle">
                <button class="toggle-btn ${subSec.customPivot ? 'active' : ''}" data-value="on">On</button>
                <button class="toggle-btn ${!subSec.customPivot ? 'active' : ''}" data-value="off">Off</button>
              </div>
            </div>
            
            <div class="sub-pivot-container" style="display: ${subSec.customPivot ? 'block' : 'none'}; margin-top: 10px; padding-bottom: 10px;">
              <div class="control-group">
                <label>Sub-section Pivot</label>
                <div class="solid-size-row">
                  <div class="input-group" style="flex:1">
                    <input type="number" class="sub-pivot-x" value="${subSec.pivotX !== undefined ? subSec.pivotX : 0}" step="1" title="Pivot X">
                    <div class="input-suffix">PX</div>
                  </div>
                  <div class="input-group" style="flex:1">
                    <input type="number" class="sub-pivot-y" value="${subSec.pivotY !== undefined ? subSec.pivotY : 0}" step="1" title="Pivot Y">
                    <div class="input-suffix">PY</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="control-group">
              <label>Layers in Sub-section</label>
              <div class="stepper-input">
                <button class="stepper-btn sub-layer-minus">−</button>
                <input type="number" class="sub-layer-count" min="1" max="50" value="${subSec.layerCount || 5}">
                <button class="stepper-btn sub-layer-plus">+</button>
              </div>
            </div>

            <div class="control-group">
              <label>Split Direction</label>
              <select class="sub-split-direction">
                <option value="global" ${subSec.splitDirection === 'global' ? 'selected' : ''}>Global Default</option>
                <option value="horizontal" ${subSec.splitDirection === 'horizontal' ? 'selected' : ''}>Horizontal</option>
                <option value="vertical" ${subSec.splitDirection === 'vertical' ? 'selected' : ''}>Vertical</option>
              </select>
            </div>

            <div class="control-group">
              <label>Animation Order</label>
              <select class="sub-anim-order">
                <option value="topDown" ${subSec.animOrder === 'topDown' ? 'selected' : ''}>Top to Bottom</option>
                <option value="bottomUp" ${subSec.animOrder === 'bottomUp' ? 'selected' : ''}>Bottom to Top</option>
              </select>
            </div>

            <div class="control-group anim-flip-only" style="display: ${state.animType === 'flip' ? 'block' : 'none'}">
              <label>Flip Angle Start/End</label>
              <div class="solid-size-row">
                <div class="input-group">
                  <input type="number" class="sub-start-angle" value="${subSec.startAngle}" step="1">
                  <div class="input-suffix">S</div>
                </div>
                <div class="input-group">
                  <input type="number" class="sub-end-angle" value="${subSec.endAngle}" step="1">
                  <div class="input-suffix">E</div>
                </div>
              </div>
            </div>

            <div class="control-group anim-flip-only" style="display: ${state.animType === 'flip' ? 'block' : 'none'}">
              <label>Flip Axis</label>
              <div class="input-group">
                <input type="number" class="sub-axis" value="${subSec.axis}" step="1">
                <div class="input-suffix">AXIS</div>
              </div>
            </div>

            <div class="control-group anim-cube-only" style="display: ${state.animType === 'cube' ? 'block' : 'none'}">
              <label>Cube Rotation X (Up/Down)</label>
              <div class="solid-size-row">
                <div class="input-group">
                  <input type="number" class="sub-cube-x-start" value="${subSec.cubeXStart || 0}" step="1">
                  <div class="input-suffix">S</div>
                </div>
                <div class="input-group">
                  <input type="number" class="sub-cube-x-end" value="${subSec.cubeXEnd || 0}" step="1">
                  <div class="input-suffix">E</div>
                </div>
              </div>
            </div>

            <div class="control-group anim-cube-only" style="display: ${state.animType === 'cube' ? 'block' : 'none'}">
              <label>Cube Rotation Y (Left/Right)</label>
              <div class="solid-size-row">
                <div class="input-group">
                  <input type="number" class="sub-cube-y-start" value="${subSec.cubeYStart || 0}" step="1">
                  <div class="input-suffix">S</div>
                </div>
                <div class="input-group">
                  <input type="number" class="sub-cube-y-end" value="${subSec.cubeYEnd || 0}" step="1">
                  <div class="input-suffix">E</div>
                </div>
              </div>
            </div>

            <div class="control-group anim-cube-only" style="display: ${state.animType === 'cube' ? 'block' : 'none'}">
              <label>Cube Rotation Z (Spin)</label>
              <div class="solid-size-row">
                <div class="input-group">
                  <input type="number" class="sub-cube-z-start" value="${subSec.cubeZStart || 0}" step="1">
                  <div class="input-suffix">S</div>
                </div>
                <div class="input-group">
                  <input type="number" class="sub-cube-z-end" value="${subSec.cubeZEnd || 0}" step="1">
                  <div class="input-suffix">E</div>
                </div>
              </div>
            </div>

            <div class="control-group">
              <label>Custom Easing</label>
              <div class="toggle-group sub-easing-toggle">
                <button class="toggle-btn ${subSec.customEasing ? 'active' : ''}" data-value="on">On</button>
                <button class="toggle-btn ${!subSec.customEasing ? 'active' : ''}" data-value="off">Off</button>
              </div>
            </div>
            
            <div class="control-group sub-easing-btn-container" style="display: ${subSec.customEasing ? 'block' : 'none'}; margin-top: 10px;">
              <button class="sub-open-graph-btn" style="width:100%; padding: 8px; background: var(--bg-elevated); border: 1px solid var(--border-subtle); color: var(--text-primary); border-radius: var(--radius-sm); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                Edit Sub-section Easing
              </button>
            </div>

            <div class="control-group" style="margin-top: 16px;">
              <label>Custom Timing</label>
              <div class="toggle-group sub-timing-toggle">
                <button class="toggle-btn ${subSec.customTiming ? 'active' : ''}" data-value="on">On</button>
                <button class="toggle-btn ${!subSec.customTiming ? 'active' : ''}" data-value="off">Off</button>
              </div>
            </div>
            
            <div class="sub-timing-container" style="display: ${subSec.customTiming ? 'block' : 'none'}; margin-top: 10px; padding-left: 10px; border-left: 2px solid var(--border-subtle);">
              <div class="control-group">
                <label>Beat 1 (All Start)</label>
                <input type="text" class="time-input sub-beat1" value="${subSec.beat1Str}" placeholder="MM:SS:FF">
              </div>
              <div class="control-group">
                <label>Beat 2 (First Ends)</label>
                <input type="text" class="time-input sub-beat2" value="${subSec.beat2Str}" placeholder="MM:SS:FF">
              </div>
              <div class="control-group">
                <label>Beat 3 (Last Ends)</label>
                <input type="text" class="time-input sub-beat3" value="${subSec.beat3Str}" placeholder="MM:SS:FF">
              </div>
            </div>
          </div>
        `;
      }
      
      html += `
          </div>
        </div>
      `;
    }
    container.innerHTML = html;

    container.querySelectorAll('.section-block').forEach(block => {
      const secIdx = parseInt(block.dataset.index);
      
      const subInput = block.querySelector('.sec-sub-count');
      
      block.querySelector('.sec-sub-minus').addEventListener('click', () => {
        let val = parseInt(subInput.value) || 1;
        if (val > 1) {
          val--;
          subInput.value = val;
          state.sections[secIdx].subSectionCount = val;
          while (state.sections[secIdx].subSections.length > val) {
            state.sections[secIdx].subSections.pop();
          }
          renderSectionsUI();
          fullUpdate();
        }
      });

      block.querySelector('.sec-sub-plus').addEventListener('click', () => {
        let val = parseInt(subInput.value) || 1;
        if (val < 10) {
          val++;
          subInput.value = val;
          state.sections[secIdx].subSectionCount = val;
          while (state.sections[secIdx].subSections.length < val) {
            const last = state.sections[secIdx].subSections[state.sections[secIdx].subSections.length - 1];
            state.sections[secIdx].subSections.push({ ...last });
          }
          renderSectionsUI();
          fullUpdate();
        }
      });

      subInput.addEventListener('input', (e) => {
        let val = parseInt(e.target.value);
        if (isNaN(val) || val < 1) val = 1;
        if (val > 10) val = 10;
        state.sections[secIdx].subSectionCount = val;
        while (state.sections[secIdx].subSections.length < val) {
          const last = state.sections[secIdx].subSections[state.sections[secIdx].subSections.length - 1];
          state.sections[secIdx].subSections.push({ ...last });
        }
        while (state.sections[secIdx].subSections.length > val) {
          state.sections[secIdx].subSections.pop();
        }
        renderSectionsUI();
        fullUpdate();
      });

      const sec = state.sections[secIdx];

      // Move toggle On/Off
      const moveToggle = block.querySelector('.sec-move-toggle');
      if (moveToggle) {
        moveToggle.addEventListener('click', (e) => {
          const btn = e.target.closest('.toggle-btn');
          if (!btn) return;
          sec.moveEnabled = (btn.dataset.value === 'on');
          if (sec.moveDistance === undefined) {
            sec.moveDistance = (sec.movePreset === 'up' || sec.movePreset === 'down') ? state.projectHeight : state.projectWidth;
          }
          if (sec.moveStartX === undefined) {
            sec.moveStartX = 0;
            sec.moveStartY = state.projectHeight / 2;
            sec.moveEndX = state.projectWidth / 2;
            sec.moveEndY = state.projectHeight / 2;
          }
          renderSectionsUI();
          fullUpdate();
        });
      }

      // Move Mode toggle (preset vs coords)
      const modeToggle = block.querySelector('.sec-move-mode-toggle');
      if (modeToggle) {
        modeToggle.addEventListener('click', (e) => {
          const btn = e.target.closest('.toggle-btn');
          if (!btn) return;
          sec.moveMode = btn.dataset.value;
          renderSectionsUI();
          fullUpdate();
        });
      }

      // Preset direction select
      const dirSelect = block.querySelector('.sec-move-direction-select');
      if (dirSelect) {
        dirSelect.addEventListener('change', (e) => {
          sec.movePreset = e.target.value;
          if (!sec.moveDistanceEdited) {
            sec.moveDistance = (sec.movePreset === 'up' || sec.movePreset === 'down') ? state.projectHeight : state.projectWidth;
            const distInput = block.querySelector('.sec-move-distance');
            if (distInput) distInput.value = sec.moveDistance;
          }
          fullUpdate();
        });
      }

      // Transition Flow select (in vs out)
      const flowSelect = block.querySelector('.sec-move-flow-select');
      if (flowSelect) {
        flowSelect.addEventListener('change', (e) => {
          sec.moveTransitionType = e.target.value;
          fullUpdate();
        });
      }

      // Travel distance input
      const distInput = block.querySelector('.sec-move-distance');
      if (distInput) {
        distInput.addEventListener('input', (e) => {
          sec.moveDistance = parseFloat(e.target.value) || 0;
          sec.moveDistanceEdited = true;
          fullUpdate();
        });
      }

      // Custom coordinate inputs
      const startXInput = block.querySelector('.sec-move-start-x');
      const startYInput = block.querySelector('.sec-move-start-y');
      const endXInput = block.querySelector('.sec-move-end-x');
      const endYInput = block.querySelector('.sec-move-end-y');

      if (startXInput) {
        startXInput.addEventListener('input', (e) => {
          sec.moveStartX = parseFloat(e.target.value) || 0;
          fullUpdate();
        });
      }
      if (startYInput) {
        startYInput.addEventListener('input', (e) => {
          sec.moveStartY = parseFloat(e.target.value) || 0;
          fullUpdate();
        });
      }
      if (endXInput) {
        endXInput.addEventListener('input', (e) => {
          sec.moveEndX = parseFloat(e.target.value) || 0;
          fullUpdate();
        });
      }
      if (endYInput) {
        endYInput.addEventListener('input', (e) => {
          sec.moveEndY = parseFloat(e.target.value) || 0;
          fullUpdate();
        });
      }

      // Snap End to Center button
      const snapCenterBtn = block.querySelector('.sec-move-fill-center-btn');
      if (snapCenterBtn) {
        snapCenterBtn.addEventListener('click', () => {
          sec.moveEndX = state.projectWidth / 2;
          sec.moveEndY = state.projectHeight / 2;
          if (endXInput) endXInput.value = sec.moveEndX;
          if (endYInput) endYInput.value = sec.moveEndY;
          fullUpdate();
        });
      }

      // Move Custom Easing toggle
      const easingToggle = block.querySelector('.sec-move-easing-toggle');
      if (easingToggle) {
        easingToggle.addEventListener('click', (e) => {
          const btn = e.target.closest('.toggle-btn');
          if (!btn) return;
          sec.moveCustomEasing = (btn.dataset.value === 'on');
          if (!sec.moveEasing) sec.moveEasing = '0.345870, 0.0, 0.188790, 1.0';
          renderSectionsUI();
          fullUpdate();
        });
      }

      // Edit Section Move Graph button
      const openMoveGraphBtn = block.querySelector('.sec-move-open-graph-btn');
      if (openMoveGraphBtn) {
        openMoveGraphBtn.addEventListener('click', () => {
          currentEditingTarget = `section-move-${secIdx}`;
          graphIframe.style.display = 'block';
          graphIframe2.style.display = 'none';
          graphModal.style.display = 'flex';
          const ease = sec.moveEasing || '0.345870, 0.0, 0.188790, 1.0';
          const parts = ease.replace(/,/g, ' ').trim().split(/\s+/).map(Number);
          if (parts.length === 4 && graphIframe.contentWindow) {
            try {
              graphIframe.contentWindow.postMessage({
                type: 'SET_BEZIER',
                x1: parts[0], y1: parts[1], x2: parts[2], y2: parts[3]
              }, '*');
            } catch (err) {}
          }
        });
      }
    });

    container.querySelectorAll('.sub-section-block').forEach(block => {
      const secIdx = parseInt(block.dataset.secIndex);
      const subIdx = parseInt(block.dataset.subIndex);
      const subSec = state.sections[secIdx].subSections[subIdx];
      
      const layerInput = block.querySelector('.sub-layer-count');
      
      block.querySelector('.sub-layer-minus').addEventListener('click', () => {
        let val = parseInt(layerInput.value) || 1;
        if (val > 1) {
          val--;
          layerInput.value = val;
          subSec.layerCount = val;
          fullUpdate();
        }
      });

      block.querySelector('.sub-layer-plus').addEventListener('click', () => {
        let val = parseInt(layerInput.value) || 1;
        if (val < 50) {
          val++;
          layerInput.value = val;
          subSec.layerCount = val;
          fullUpdate();
        }
      });

      layerInput.addEventListener('input', (e) => {
        let val = parseInt(e.target.value);
        if (isNaN(val) || val < 1) val = 1;
        if (val > 50) val = 50;
        subSec.layerCount = val;
        fullUpdate();
      });

      block.querySelector('.sub-pivot-toggle').addEventListener('click', (e) => {
        const btn = e.target.closest('.toggle-btn');
        if (!btn) return;
        subSec.customPivot = btn.dataset.value === 'on';
        if (subSec.pivotX === undefined) subSec.pivotX = 0;
        if (subSec.pivotY === undefined) subSec.pivotY = 0;
        renderSectionsUI();
        fullUpdate();
      });

      block.querySelector('.sub-pivot-x').addEventListener('input', (e) => {
        subSec.pivotX = parseFloat(e.target.value) || 0;
        fullUpdate();
      });

      block.querySelector('.sub-pivot-y').addEventListener('input', (e) => {
        subSec.pivotY = parseFloat(e.target.value) || 0;
        fullUpdate();
      });

      block.querySelector('.sub-split-direction').addEventListener('change', (e) => {
        subSec.splitDirection = e.target.value;
        fullUpdate();
      });

      block.querySelector('.sub-anim-order').addEventListener('change', (e) => {
        subSec.animOrder = e.target.value;
        fullUpdate();
      });
      
      block.querySelector('.sub-start-angle').addEventListener('input', (e) => {
        subSec.startAngle = parseFloat(e.target.value) || 0;
        fullUpdate();
      });
      
      block.querySelector('.sub-end-angle').addEventListener('input', (e) => {
        subSec.endAngle = parseFloat(e.target.value) || 0;
        fullUpdate();
      });
      
      block.querySelector('.sub-axis').addEventListener('input', (e) => {
        subSec.axis = parseFloat(e.target.value) || 0;
        fullUpdate();
      });
      
      block.querySelector('.sub-cube-x-start')?.addEventListener('input', (e) => {
        subSec.cubeXStart = parseFloat(e.target.value) || 0;
        fullUpdate();
      });
      
      block.querySelector('.sub-cube-x-end')?.addEventListener('input', (e) => {
        subSec.cubeXEnd = parseFloat(e.target.value) || 0;
        fullUpdate();
      });
      
      block.querySelector('.sub-cube-y-start')?.addEventListener('input', (e) => {
        subSec.cubeYStart = parseFloat(e.target.value) || 0;
        fullUpdate();
      });
      
      block.querySelector('.sub-cube-y-end')?.addEventListener('input', (e) => {
        subSec.cubeYEnd = parseFloat(e.target.value) || 0;
        fullUpdate();
      });
      
      block.querySelector('.sub-cube-z-start')?.addEventListener('input', (e) => {
        subSec.cubeZStart = parseFloat(e.target.value) || 0;
        fullUpdate();
      });
      
      block.querySelector('.sub-cube-z-end')?.addEventListener('input', (e) => {
        subSec.cubeZEnd = parseFloat(e.target.value) || 0;
        fullUpdate();
      });
      
      block.querySelector('.sub-easing-toggle').addEventListener('click', (e) => {
        const btn = e.target.closest('.toggle-btn');
        if (!btn) return;
        subSec.customEasing = (btn.dataset.value === 'on');
        renderSectionsUI();
        fullUpdate();
      });
      
      const editBtn = block.querySelector('.sub-open-graph-btn');
      if (editBtn) {
        editBtn.addEventListener('click', () => {
          currentEditingTarget = `sub-section-${secIdx}-${subIdx}`;
          graphIframe.style.display = 'block';
          graphIframe2.style.display = 'none';
          graphModal.style.display = 'flex';
          const ease = subSec.easing || '0.25, 0.10, 0.25, 1.00';
          const parts = ease.replace(/,/g, ' ').trim().split(/\s+/).map(Number);
          if (parts.length === 4 && graphIframe.contentWindow) {
            try {
              graphIframe.contentWindow.postMessage({
                type: 'SET_BEZIER',
                x1: parts[0], y1: parts[1], x2: parts[2], y2: parts[3]
              }, '*');
            } catch (err) {}
          }
        });
      }

      block.querySelector('.sub-timing-toggle').addEventListener('click', (e) => {
        const btn = e.target.closest('.toggle-btn');
        if (!btn) return;
        subSec.customTiming = (btn.dataset.value === 'on');
        renderSectionsUI();
        fullUpdate();
      });
      
      block.querySelector('.sub-beat1').addEventListener('input', (e) => {
        subSec.beat1Str = e.target.value;
        fullUpdate();
      });
      
      block.querySelector('.sub-beat2').addEventListener('input', (e) => {
        subSec.beat2Str = e.target.value;
        fullUpdate();
      });
      
      block.querySelector('.sub-beat3').addEventListener('input', (e) => {
        subSec.beat3Str = e.target.value;
        fullUpdate();
      });
    });
  }

  // ---- Update Functions ----
  function updateProjectSize() {
    const scale = parseFloat(projectScaleSelect.value) || 1;
    state.projectWidth = state.baseWidth * scale;
    state.projectHeight = state.baseHeight * scale;

    previewDimensions.textContent = `${state.projectWidth} × ${state.projectHeight}`;
    wipeXDisplay.textContent = state.projectWidth / 2;
    wipeYDisplay.textContent = state.projectHeight / 2;
    crosshairLabel.textContent = `Center: ${state.projectWidth / 2}, ${state.projectHeight / 2}`;
  }

  function updateFormulas() {
    const layers = calculateLayers();
    const n = layers.length || 1;
    let html = '';

    const isMask = state.wipeMethod === 'mask';
    const isHoriz = state.splitDirection === 'horizontal';

    // Ratio telemetry
    const curRatio = (state.solidWidth / state.solidHeight).toFixed(3);
    const is45 = Math.abs((state.solidWidth / state.solidHeight) - 0.8) < 0.01;
    const ratioBadge = is45 ? '<span style="color:var(--cyan); font-weight:700;">4:5 PERFECT</span>' : `${curRatio} (${state.solidWidth}×${state.solidHeight})`;

    if (isMask) {
      html += `<div class="formula-section-head">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/></svg>
        Masking Mode — Physical Slices (Connected Group &amp; Mask Slicing)
      </div>`;
      html += `<div class="formula-callout">
        <strong>Masking Mode active:</strong> Instead of Alight Motion's <code>wipe2</code> effect, each slice layer is an isolated Group &amp; Mask (<code>&lt;embedScene&gt;</code>) containing the full media image masked by a <code>blending="mask"</code> stencil. All <strong>${n}</strong> slice layers connect together into one seamless image.
      </div>`;

      html += `<div class="formula-line"><span class="formula-label">Slicing Mode</span><span class="formula-expr" style="color:var(--cyan)">MASKING (SEPARATE SHAPES)</span></div>`;
      html += `<div class="formula-line"><span class="formula-label">Solid Aspect</span><span class="formula-expr">${ratioBadge}</span></div>`;
      html += `<div class="formula-line"><span class="formula-label">Total Scale X</span><span class="formula-expr">${(state.solidWidth / 200).toFixed(4)}</span></div>`;
      html += `<div class="formula-line"><span class="formula-label">Total Scale Y</span><span class="formula-expr">${(state.solidHeight / 200).toFixed(4)}</span></div>`;
      html += `<div class="formula-line"><span class="formula-label">Total Slices</span><span class="formula-expr">${n} Layers</span></div>`;
      html += `<div class="formula-line"><span class="formula-label">Split Axis</span><span class="formula-expr">${isHoriz ? 'HORIZONTAL (Left → Right)' : 'VERTICAL (Up → Down)'}</span></div>`;

      // Horizontal formulas (Left to Right)
      html += `<div class="formula-section-head" style="margin-top:10px; color:${isHoriz ? 'var(--cyan)' : 'var(--text-2)'}">
        <span>1. Horizontal Slicing Formulas (Rectangles Going Left → Right)</span>
      </div>`;
      html += `<div class="formula-line"><span class="formula-label">Slice Width</span><span class="formula-expr">W = solidWidth = ${state.solidWidth.toFixed(1)} px (Full Width)</span></div>`;
      html += `<div class="formula-line"><span class="formula-label">Slice Height</span><span class="formula-expr">H = solidHeight / ${n} = ${(state.solidHeight / n).toFixed(2)} px</span></div>`;
      html += `<div class="formula-line"><span class="formula-label">Scale X (AM)</span><span class="formula-expr">scaleX = W / 200 = ${(state.solidWidth / 200).toFixed(6)}</span></div>`;
      html += `<div class="formula-line"><span class="formula-label">Scale Y (AM)</span><span class="formula-expr">scaleY = H / 200 = ${((state.solidHeight / n) / 200).toFixed(6)}</span></div>`;
      html += `<div class="formula-line"><span class="formula-label">Location X</span><span class="formula-expr">locX = CenterX = ${(state.projectWidth / 2).toFixed(1)} px</span></div>`;
      html += `<div class="formula-line"><span class="formula-label">Location Y(i)</span><span class="formula-expr">locY = Top + (i + 0.5) × ${(state.solidHeight / n).toFixed(2)} px</span></div>`;

      // Vertical formulas (Up to Down)
      html += `<div class="formula-section-head" style="margin-top:10px; color:${!isHoriz ? 'var(--cyan)' : 'var(--text-2)'}">
        <span>2. Vertical Slicing Formulas (Rectangles Going Up → Down · Project 294)</span>
      </div>`;
      html += `<div class="formula-line"><span class="formula-label">Slice Width</span><span class="formula-expr">W = solidWidth / ${n} = ${(state.solidWidth / n).toFixed(2)} px</span></div>`;
      html += `<div class="formula-line"><span class="formula-label">Slice Height</span><span class="formula-expr">H = solidHeight = ${state.solidHeight.toFixed(1)} px (Full Height)</span></div>`;
      html += `<div class="formula-line"><span class="formula-label">Scale X (AM)</span><span class="formula-expr">scaleX = W / 200 = ${((state.solidWidth / n) / 200).toFixed(6)}</span></div>`;
      html += `<div class="formula-line"><span class="formula-label">Scale Y (AM)</span><span class="formula-expr">scaleY = H / 200 = ${(state.solidHeight / 200).toFixed(6)}</span></div>`;
      html += `<div class="formula-line"><span class="formula-label">Location X(i)</span><span class="formula-expr">locX = Left + (i + 0.5) × ${(state.solidWidth / n).toFixed(2)} px</span></div>`;
      html += `<div class="formula-line"><span class="formula-label">Location Y</span><span class="formula-expr">locY = CenterY = ${(state.projectHeight / 2).toFixed(1)} px</span></div>`;

    } else {
      // Classic Wipe Mode
      html += `<div class="formula-section-head">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="2" y1="12" x2="22" y2="12"/><polyline points="12 2 22 12 12 22"/></svg>
        Wipe Effect Mode — Normalized Range Slices
      </div>`;
      html += `<div class="formula-line"><span class="formula-label">Slicing Mode</span><span class="formula-expr">WIPE EFFECT</span></div>`;
      html += `<div class="formula-line"><span class="formula-label">Project</span><span class="formula-expr">${state.projectWidth} × ${state.projectHeight} px</span></div>`;
      html += `<div class="formula-line"><span class="formula-label">Solid</span><span class="formula-expr">${state.solidWidth} × ${state.solidHeight} px</span></div>`;
      html += `<div class="formula-line"><span class="formula-label">Location</span><span class="formula-expr">${state.projectWidth / 2}, ${state.projectHeight / 2}</span></div>`;
      html += `<div class="formula-line"><span class="formula-label">Wipe Angle</span><span class="formula-expr">${state.splitDirection === 'horizontal' ? '90° (Horizontal)' : '0° (Vertical)'}</span></div>`;
      html += `<div class="formula-line"><span class="formula-label">Seam Overscan</span><span class="formula-expr">${WIPE_SEAM_OVERSCAN_PX} px</span></div>`;
    }

    formulaContent.innerHTML = html;
  }

  function updateLayerTable() {
    const layers = calculateLayers();
    const isMask = state.wipeMethod === 'mask';
    let html = '';

    if (thCol4) thCol4.textContent = isMask ? 'Size (W×H)' : 'Size';
    if (thCol5) thCol5.textContent = isMask ? 'Scale X' : 'Wipe X';
    if (thCol6) thCol6.textContent = isMask ? 'Scale Y' : 'Wipe Y';

    layers.forEach((layer) => {
      const col4Val = `${layer.width.toFixed(1)}×${layer.height.toFixed(1)}`;
      const col5Val = isMask ? (layer.width / 200).toFixed(4) : `${layer.wipeXStart.toFixed(2)} - ${layer.wipeXEnd.toFixed(2)}`;
      const col6Val = isMask ? (layer.height / 200).toFixed(4) : `${layer.wipeYStart.toFixed(2)} - ${layer.wipeYEnd.toFixed(2)}`;

      html += `<tr>
        <td class="layer-index">${layer.index}</td>
        <td>${layer.locX.toFixed(1)}</td>
        <td>${layer.locY.toFixed(1)}</td>
        <td>${col4Val}</td>
        <td>${col5Val}</td>
        <td>${col6Val}</td>
      </tr>`;
    });

    const tbody = $('#layerTableBody');
    if (tbody) tbody.innerHTML = html;
  }

  // ---- Alight Motion XML Generation ----
  function generateAlightMotionXML(overrideLayers) {
    const layers = overrideLayers || calculateLayers();
    const t = '  '; // indent
    const totalTimeMs = Math.round(parseTimeToSeconds(state.projectDurationStr) * 1000);
    const fps = state.fps;

    let hexColor = state.solidColor.toUpperCase();
    if (hexColor.startsWith('#')) hexColor = hexColor.substring(1);
    const amColor = `#FF${hexColor}`;

    let xml = `<?xml version='1.0' encoding='UTF-8' ?>\n`;
    xml += `<!--\n`;
    xml += `Created by ALIGHT MOTION XMLS Rectangle Wipe Generator\n`;
    xml += `Exported: ${new Date().toLocaleString()}\n`;
    xml += `-->\n`;

    const sceneTitle = state.wipeMethod === 'mask'
      ? `Project Name Masking ${layers.length}x`
      : `Wipe Layers ${layers.length}x`;

    xml += `<scene title="${sceneTitle}" width="${state.projectWidth}" height="${state.projectHeight}" exportWidth="${state.projectWidth}" exportHeight="${state.projectHeight}" bgcolor="#FF000000" totalTime="${totalTimeMs}" fps="${fps}" modifiedTime="${Date.now()}" amver="868" ffver="107" am="com.alightcreative.motion/6.2.59" amplatform="ios" precompose="dynamicResolution" retime="freeze">\n`;

    xml += `${t}<bookmark t="0"/>\n`;
    xml += `${t}<bookmark t="${totalTimeMs}"/>\n`;

    const useVideo = state.videoLayer && state.videoUri.trim() !== '';
    const videoUri = escapeXmlAttr(state.videoUri.trim());
    if (useVideo) {
      const dur = Math.max(1, Math.round(state.videoDurationMs || totalTimeMs));
      xml += `${t}<media uri="${videoUri}" type="video/mp4" duration="${dur}" fps="${fps}" width="${state.projectWidth}" height="${state.projectHeight}"/>\n`;
    }

    // Helper to generate 3D rotation & orient effects (flip3, cube2, box)
    function generateEffectsXml(layer, indent) {
      if (state.animType !== 'flip' && state.animType !== 'cube' && state.animType !== 'box') {
        return '';
      }
      let effXml = '';
      const projDurationSec = parseTimeToSeconds(state.projectDurationStr) || 1;
      const normStart = layer.flipStartT / projDurationSec;
      const normEnd = layer.flipEndT / projDurationSec;

      let easingStr = '';
      if (layer.flipEasing) {
        const bezierParts = layer.flipEasing.split(',').map(s => s.trim());
        easingStr = ` e="cubicBezier ${bezierParts.join(' ')}"`;
      }

      if (state.animType === 'flip') {
        effXml += `${indent}<effect id="com.alightcreative.effects.flip3" locallyApplied="true">\n`;
        effXml += `${indent}${t}<property name="axis" type="float" value="${layer.flipAxis.toFixed(6)}"/>\n`;
        effXml += `${indent}${t}<property name="pivot" type="vec2" value="${layer.pivotX.toFixed(6)},${layer.pivotY.toFixed(6)}"/>\n`;
        effXml += `${indent}${t}<property name="angle" type="float">\n`;
        effXml += `${indent}${t}${t}<kf t="${normStart.toFixed(6)}" v="${layer.flipStartAngle.toFixed(6)}" />\n`;
        effXml += `${indent}${t}${t}<kf t="${normEnd.toFixed(6)}" v="${layer.flipEndAngle.toFixed(6)}"${easingStr} />\n`;
        effXml += `${indent}${t}</property>\n`;
        effXml += `${indent}</effect>\n`;
      } else if (state.animType === 'cube') {
        const isHorizontalSplit = state.splitDirection === 'horizontal';
        const maskCubeReferenceWidth = isHorizontalSplit ? 625 : 78.1;
        const maskCubeReferenceHeight = isHorizontalSplit ? 78.1 : 625;
        const maskCubeReferenceScale = 1.97;
        const MASK_CUBE_CALIBRATION_LAYERS = 5;
        const calibTileW = (isHorizontalSplit
          ? state.solidWidth
          : state.solidWidth / MASK_CUBE_CALIBRATION_LAYERS) + (MASK_SEAM_OVERSCAN_PX * 2);
        const calibTileH = (isHorizontalSplit
          ? state.solidHeight / MASK_CUBE_CALIBRATION_LAYERS
          : state.solidHeight) + (MASK_SEAM_OVERSCAN_PX * 2);
        const maskCubeAreaRatio = (calibTileW * calibTileH) /
          (maskCubeReferenceWidth * maskCubeReferenceHeight);
        const cubeScale = state.wipeMethod === 'mask'
          ? maskCubeReferenceScale * Math.sqrt(Math.max(maskCubeAreaRatio, 0))
          : 1.32 * (layer.width / (state.projectWidth * (650 / 1080)));
        
        const cubeWidth = state.projectWidth / 1000;
        const cubeHeight = state.wipeMethod === 'mask' && state.splitDirection !== 'horizontal'
          ? 1.056
          : state.projectHeight / 1000;
        const cubeDepth = state.projectWidth / 1000;
        
        effXml += `${indent}<effect id="com.alightcreative.effects.cube2" locallyApplied="true">\n`;
        effXml += `${indent}${t}<property name="depth" type="float" value="${cubeDepth.toFixed(6)}"/>\n`;
        effXml += `${indent}${t}<property name="height" type="float" value="${cubeHeight.toFixed(6)}"/>\n`;
        effXml += `${indent}${t}<property name="rotate" type="vec3">\n`;
        effXml += `${indent}${t}${t}<kf t="${normStart.toFixed(6)}" v="${layer.cubeXStart.toFixed(6)},${layer.cubeYStart.toFixed(6)},${layer.cubeZStart.toFixed(6)}" />\n`;
        effXml += `${indent}${t}${t}<kf t="${normEnd.toFixed(6)}" v="${layer.cubeXEnd.toFixed(6)},${layer.cubeYEnd.toFixed(6)},${layer.cubeZEnd.toFixed(6)}"${easingStr} />\n`;
        effXml += `${indent}${t}</property>\n`;
        effXml += `${indent}${t}<property name="position" type="vec3" value="0.000000,0.000000,0.000000"/>\n`;
        effXml += `${indent}${t}<property name="scale" type="float" value="${cubeScale.toFixed(6)}"/>\n`;
        effXml += `${indent}${t}<property name="shadingType" type="int" value="0"/>\n`;
        effXml += `${indent}${t}<property name="width" type="float" value="${cubeWidth.toFixed(6)}"/>\n`;
        effXml += `${indent}</effect>\n`;
      } else if (state.animType === 'box') {
        effXml += `${indent}<effect id="com.alightcreative.effects.box" locallyApplied="true">\n`;
        effXml += `${indent}${t}<property name="depth" type="float" value="${state.box.depth.toFixed(6)}"/>\n`;
        effXml += `${indent}${t}<property name="scale" type="float" value="${state.box.scale.toFixed(6)}"/>\n`;

        const normOrientStart = layer.orientStartT / projDurationSec;
        const normOrientEnd = layer.orientEndT / projDurationSec;
        const startQuat = eulerToQuaternion(state.box.orientStartX, state.box.orientStartY, state.box.orientStartZ);
        const endQuat = eulerToQuaternion(state.box.orientEndX, state.box.orientEndY, state.box.orientEndZ);
        const orientEasingStr = ` e="cubicBezier ${state.box.orientEasing.replace(/, /g, ' ')}"`;
        const rotateEasingStr = ` e="cubicBezier ${state.box.rotateEasing.replace(/, /g, ' ')}"`;

        effXml += `${indent}${t}<property name="orient" type="quat">\n`;
        effXml += `${indent}${t}${t}<kf t="${normOrientStart.toFixed(6)}" v="${startQuat.w.toFixed(6)},${startQuat.x.toFixed(6)},${startQuat.y.toFixed(6)},${startQuat.z.toFixed(6)}" />\n`;
        effXml += `${indent}${t}${t}<kf t="${normOrientEnd.toFixed(6)}" v="${endQuat.w.toFixed(6)},${endQuat.x.toFixed(6)},${endQuat.y.toFixed(6)},${endQuat.z.toFixed(6)}" ${orientEasingStr} />\n`;
        effXml += `${indent}${t}</property>\n`;

        const normRotateStart = layer.rotateStartT / projDurationSec;
        const normRotateEnd = layer.rotateEndT / projDurationSec;

        effXml += `${indent}${t}<property name="rotate" type="vec3">\n`;
        effXml += `${indent}${t}${t}<kf t="${normRotateStart.toFixed(6)}" v="${state.box.rotateStartX.toFixed(6)},${state.box.rotateStartY.toFixed(6)},${state.box.rotateStartZ.toFixed(6)}" />\n`;
        effXml += `${indent}${t}${t}<kf t="${normRotateEnd.toFixed(6)}" v="${state.box.rotateEndX.toFixed(6)},${state.box.rotateEndY.toFixed(6)},${state.box.rotateEndZ.toFixed(6)}" ${rotateEasingStr} />\n`;
        effXml += `${indent}${t}</property>\n`;

        effXml += `${indent}${t}<property name="height" type="float" value="1.0"/>\n`;
        effXml += `${indent}${t}<property name="shadingType" type="int" value="1"/>\n`;
        effXml += `${indent}</effect>\n`;
      }
      return effXml;
    }

    // Generate layers in reverse so layer 1 is at the bottom (matching AM export order)
    for (let i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i];
      const layerLabel = i === 0 ? "Rectangle 1" : `Rectangle 1 Copy${i > 1 ? ' ' + i : ''}`;

      if (state.wipeMethod === 'mask') {
        // Group & Mask architecture: Each layer is an <embedScene> containing:
        // Shape 1 (Media/Solid): full solid dimensions, positioned with offset so the slice window reveals its part of the connected whole.
        // Shape 2 (Mask): matching slice dimensions with blending="mask" to stencil the window.
        const tileW = layer.width;
        const tileH = layer.height;
        const cx = tileW / 2.0;
        const cy = tileH / 2.0;
        // In project coordinates, solid center is (projectWidth/2, projectHeight/2) and slice center is (layer.locX, layer.locY).
        const offsetX = (state.projectWidth / 2.0) - layer.locX;
        const offsetY = (state.projectHeight / 2.0) - layer.locY;
        const mediaLocX = cx + offsetX;
        const mediaLocY = cy + offsetY;

        xml += `${t}<embedScene id="${layer.index}" label="${layerLabel}" startTime="0" endTime="${totalTimeMs}" fillType="intrinsic">\n`;
        xml += `${t}${t}<transform>\n`;
        if (layer.moveEnabled) {
          let easingAttr = '';
          if (layer.moveEasing) {
            const bezierParts = layer.moveEasing.replace(/,/g, ' ').trim().split(/\s+/);
            easingAttr = ` e="cubicBezier ${bezierParts.join(' ')}"`;
          }
          const projDurationSec = parseTimeToSeconds(state.projectDurationStr) || 1;
          const normStart = layer.flipStartT / projDurationSec;
          const normEnd = layer.flipEndT / projDurationSec;
          xml += `${t}${t}${t}<location>\n`;
          xml += `${t}${t}${t}${t}<kf t="${normStart.toFixed(6)}" v="${layer.moveStartX.toFixed(6)},${layer.moveStartY.toFixed(6)},0.000000"/>\n`;
          xml += `${t}${t}${t}${t}<kf t="${normEnd.toFixed(6)}" v="${layer.moveEndX.toFixed(6)},${layer.moveEndY.toFixed(6)},0.000000"${easingAttr}/>\n`;
          xml += `${t}${t}${t}</location>\n`;
        } else {
          xml += `${t}${t}${t}<location value="${layer.locX.toFixed(6)},${layer.locY.toFixed(6)},0.000000"/>\n`;
        }
        xml += `${t}${t}${t}<scale value="1.000000,1.000000"/>\n`;
        xml += `${t}${t}</transform>\n`;

        // 3D effects on the embedScene
        xml += generateEffectsXml(layer, `${t}${t}`);

        xml += `${t}${t}<fillColor value="#FF000000"/>\n`;
        xml += `${t}${t}<scene title="" width="${Math.round(tileW)}" height="${Math.round(tileH)}" exportWidth="${Math.round(tileW)}" exportHeight="${Math.round(tileH)}" bgcolor="#00000000" totalTime="${totalTimeMs}" fps="${fps}" modifiedTime="0" amver="868" ffver="107" am="com.alightcreative.motion/6.2.59" amplatform="ios" precompose="dynamicResolution" retime="off">\n`;

        // Inner Shape 1: Media / Solid layer
        const innerFillAttrs = useVideo
          ? `fillType="media" fillVideo="${videoUri}" mediaFillMode="fill"`
          : `fillType="color"`;
        xml += `${t}${t}${t}<shape id="1" label="${layerLabel} Media" startTime="0" endTime="${totalTimeMs}" ${innerFillAttrs} s=".rect">\n`;
        xml += `${t}${t}${t}${t}<transform>\n`;
        xml += `${t}${t}${t}${t}${t}<location value="${mediaLocX.toFixed(6)},${mediaLocY.toFixed(6)},0.000000"/>\n`;
        xml += `${t}${t}${t}${t}</transform>\n`;
        if (!useVideo) {
          xml += `${t}${t}${t}${t}<fillColor value="${amColor}"/>\n`;
        }
        xml += `${t}${t}${t}${t}<property name="size" type="vec2" value="${(state.solidWidth / 2.0).toFixed(6)},${(state.solidHeight / 2.0).toFixed(6)}"/>\n`;
        xml += `${t}${t}${t}</shape>\n`;

        // Inner Shape 2: Mask Stencil
        xml += `${t}${t}${t}<shape id="2" label="${layerLabel} Mask" startTime="0" endTime="${totalTimeMs}" fillType="color" blending="mask" s=".rect">\n`;
        xml += `${t}${t}${t}${t}<transform>\n`;
        xml += `${t}${t}${t}${t}${t}<location value="${cx.toFixed(6)},${cy.toFixed(6)},0.000000"/>\n`;
        xml += `${t}${t}${t}${t}${t}<scale value="${(tileW / 200.0).toFixed(6)},${(tileH / 200.0).toFixed(6)}"/>\n`;
        xml += `${t}${t}${t}${t}</transform>\n`;
        xml += `${t}${t}${t}${t}<fillColor value="#FFFFFFFF"/>\n`;
        xml += `${t}${t}${t}</shape>\n`;

        xml += `${t}${t}</scene>\n`;
        xml += `${t}</embedScene>\n`;

      } else {
        // Wipe Method: Shape with wipe2 effect (full solid dimensions)
        let finalLocX = layer.locX;
        let finalLocY = layer.locY;
        let finalScaleX = 1.0;
        let finalScaleY = 1.0;

        const fillAttrs = useVideo
          ? `fillType="media" fillVideo="${videoUri}" mediaFillMode="fill"`
          : `fillType="color"`;
        xml += `${t}<shape id="${layer.index}" label="${layerLabel}" startTime="0" endTime="${totalTimeMs}" ${fillAttrs} s=".rect">\n`;

        xml += `${t}${t}<transform>\n`;
        if (layer.moveEnabled) {
          let easingAttr = '';
          if (layer.moveEasing) {
            const bezierParts = layer.moveEasing.replace(/,/g, ' ').trim().split(/\s+/);
            easingAttr = ` e="cubicBezier ${bezierParts.join(' ')}"`;
          }
          const projDurationSec = parseTimeToSeconds(state.projectDurationStr) || 1;
          const normStart = layer.flipStartT / projDurationSec;
          const normEnd = layer.flipEndT / projDurationSec;
          xml += `${t}${t}${t}<location>\n`;
          xml += `${t}${t}${t}${t}<kf t="${normStart.toFixed(6)}" v="${layer.moveStartX.toFixed(6)},${layer.moveStartY.toFixed(6)},0.000000"/>\n`;
          xml += `${t}${t}${t}${t}<kf t="${normEnd.toFixed(6)}" v="${layer.moveEndX.toFixed(6)},${layer.moveEndY.toFixed(6)},0.000000"${easingAttr}/>\n`;
          xml += `${t}${t}${t}</location>\n`;
        } else {
          xml += `${t}${t}${t}<location value="${finalLocX.toFixed(6)},${finalLocY.toFixed(6)},0.000000"/>\n`;
        }
        xml += `${t}${t}${t}<scale value="${finalScaleX.toFixed(6)},${finalScaleY.toFixed(6)}"/>\n`;
        xml += `${t}${t}</transform>\n`;

        if (!useVideo) xml += `${t}${t}<fillColor value="${amColor}"/>\n`;

        if (layer.wipeYStart > 0.0 || layer.wipeYEnd < 1.0) {
          xml += `${t}${t}<effect id="com.alightcreative.effects.wipe2" locallyApplied="true">\n`;
          if (layer.wipeYEnd < 1.0) xml += `${t}${t}${t}<property name="end" type="float" value="${layer.wipeYEnd.toFixed(6)}"/>\n`;
          if (layer.wipeYStart > 0.0) xml += `${t}${t}${t}<property name="start" type="float" value="${layer.wipeYStart.toFixed(6)}"/>\n`;
          xml += `${t}${t}${t}<property name="angle" type="float" value="90.000000"/>\n`;
          xml += `${t}${t}</effect>\n`;
        }
        if (layer.wipeXStart > 0.0 || layer.wipeXEnd < 1.0) {
          xml += `${t}${t}<effect id="com.alightcreative.effects.wipe2" locallyApplied="true">\n`;
          if (layer.wipeXEnd < 1.0) xml += `${t}${t}${t}<property name="end" type="float" value="${layer.wipeXEnd.toFixed(6)}"/>\n`;
          if (layer.wipeXStart > 0.0) xml += `${t}${t}${t}<property name="start" type="float" value="${layer.wipeXStart.toFixed(6)}"/>\n`;
          xml += `${t}${t}${t}<property name="angle" type="float" value="0.000000"/>\n`;
          xml += `${t}${t}</effect>\n`;
        }

        xml += generateEffectsXml(layer, `${t}${t}`);

        if (state.animType === 'cube') {
          xml += `${t}${t}<property name="size" type="vec2" value="${(state.projectWidth / 2).toFixed(6)},${(state.projectHeight / 2).toFixed(6)}"/>\n`;
        } else {
          xml += `${t}${t}<property name="size" type="vec2" value="${(layer.width / 2).toFixed(6)},${(layer.height / 2).toFixed(6)}"/>\n`;
        }

        xml += `${t}</shape>\n`;
      }
    }

    xml += `</scene>\n`;

    return xml;
  }

  function renderXML() {
    const raw = generateAlightMotionXML();
    const highlighted = raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="xml-comment">$1</span>')
      .replace(/(&lt;\?.*?\?&gt;)/g, '<span class="xml-decl">$1</span>')
      .replace(/(&lt;\/?)(\w+)/g, '$1<span class="xml-tag">$2</span>')
      .replace(/([\w]+)(=)/g, '<span class="xml-attr">$1</span>$2')
      .replace(/(".*?")/g, '<span class="xml-val">$1</span>');

    xmlCode.innerHTML = highlighted;
  }

  function updateHUD() {
    if (hudSlice) hudSlice.textContent = state.wipeMethod === 'mask' ? 'MASK' : 'WIPE';
    if (slicingBadge) slicingBadge.textContent = state.wipeMethod === 'mask' ? '4:5 MASK ACTIVE' : '4:5 MASK';
    if (preset45Fit && preset45Full) {
      preset45Fit.classList.toggle('active', Math.abs(state.solidWidth - 650) < 1 && Math.abs(state.solidHeight - 812.5) < 1);
      preset45Full.classList.toggle('active', Math.abs(state.solidWidth - 1080) < 1 && Math.abs(state.solidHeight - 1350) < 1);
    }
    const layers = calculateLayers();
    const hudLayers = $('#hudLayers');
    if (hudLayers) hudLayers.textContent = layers.length;
    const hudMode = $('#hudMode');
    if (hudMode) hudMode.textContent = state.animType.toUpperCase();
    const hudRes = $('#hudRes');
    if (hudRes) hudRes.textContent = `${state.projectWidth} × ${state.projectHeight}`;
    const hudFps = $('#hudFps');
    if (hudFps) hudFps.textContent = state.fps;
  }

  // ---- Full Update ----
  function fullUpdate() {
    updateProjectSize();
    updateFormulas();
    updateLayerTable();
    updateScrubberUI();
    updateHUD();
    renderXML();
    renderPreview();
  }

  // ---- Playback Loop ----
  let animFrameId = null;
  let lastTimeMs = 0;

  function togglePlay() {
    state.isPlaying = !state.isPlaying;
    if (state.isPlaying) {
      playIcon.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
      const durationSec = parseTimeToSeconds(state.projectDurationStr);
      if (state.currentTimeSec >= durationSec) state.currentTimeSec = 0;
      lastTimeMs = performance.now();
      animFrameId = requestAnimationFrame(playLoop);
    } else {
      playIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
      cancelAnimationFrame(animFrameId);
    }
  }

  function playLoop(now) {
    if (!state.isPlaying) return;
    const deltaMs = now - lastTimeMs;
    lastTimeMs = now;
    state.currentTimeSec += deltaMs / 1000;
    
    const durationSec = parseTimeToSeconds(state.projectDurationStr) || 1;
    if (state.currentTimeSec >= durationSec) {
      state.currentTimeSec = durationSec;
      togglePlay();
    }
    
    updateScrubberUI();
    renderPreview(state.currentTimeSec);
    if (state.isPlaying) animFrameId = requestAnimationFrame(playLoop);
  }

  function updateScrubberUI() {
    const durationSec = parseTimeToSeconds(state.projectDurationStr) || 1;
    playbackScrubber.max = durationSec;
    playbackScrubber.value = state.currentTimeSec;
    playbackTimeDisplay.textContent = state.currentTimeSec.toFixed(2) + 's';
  }

  playBtn.addEventListener('click', togglePlay);
  playbackScrubber.addEventListener('input', () => {
    state.currentTimeSec = parseFloat(playbackScrubber.value);
    updateScrubberUI();
    renderPreview(state.currentTimeSec);
  });

  // ---- Event Handlers ----

  // Slicing Method (Wipe vs Masking Mode)
  if (wipeMethodToggleGroup) {
    wipeMethodToggleGroup.addEventListener('click', (e) => {
      const btn = e.target.closest('.toggle-btn');
      if (!btn) return;
      wipeMethodToggleGroup.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.wipeMethod = btn.dataset.value;
      if (maskingOptions) {
        maskingOptions.style.display = state.wipeMethod === 'mask' ? 'block' : 'none';
      }
      fullUpdate();
    });
  }

  // 4:5 Presets
  if (preset45Fit) {
    preset45Fit.addEventListener('click', () => {
      state.solidWidth = 650;
      state.solidHeight = 812.5;
      state.aspectLocked = true;
      solidWidthInput.value = 650;
      solidHeightInput.value = 812.5;
      aspectLinkBtn.classList.add('active');
      aspectHint.textContent = 'Ratio locked at 4:5 (Project 294 Match)';
      fullUpdate();
    });
  }

  if (preset45Full) {
    preset45Full.addEventListener('click', () => {
      state.solidWidth = 1080;
      state.solidHeight = 1350;
      state.aspectLocked = true;
      solidWidthInput.value = 1080;
      solidHeightInput.value = 1350;
      aspectLinkBtn.classList.add('active');
      aspectHint.textContent = 'Ratio locked at 4:5 (Full Screen)';
      fullUpdate();
    });
  }

  // XML Masking Grouping Toggle
  if (maskGroupToggle) {
    maskGroupToggle.addEventListener('click', (e) => {
      const btn = e.target.closest('.toggle-btn');
      if (!btn) return;
      maskGroupToggle.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.maskEmbedScene = (btn.dataset.value === 'embed');
      fullUpdate();
    });
  }

  // Split direction
  splitDirectionGroup.addEventListener('click', (e) => {
    const btn = e.target.closest('.toggle-btn');
    if (!btn) return;
    splitDirectionGroup.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.splitDirection = btn.dataset.value;
    fullUpdate();
  });

  // Video layer toggle
  function syncVideoLayerUI() {
    videoLayerToggle.querySelectorAll('.toggle-btn').forEach(b =>
      b.classList.toggle('active', (b.dataset.value === 'on') === state.videoLayer));
    videoLayerControls.style.display = state.videoLayer ? 'block' : 'none';
    videoUriInput.value = state.videoUri;
    videoDurationInput.value = state.videoDurationMs;
  }

  videoLayerToggle.addEventListener('click', (e) => {
    const btn = e.target.closest('.toggle-btn');
    if (!btn) return;
    state.videoLayer = btn.dataset.value === 'on';
    syncVideoLayerUI();
    fullUpdate();
  });

  videoUriInput.addEventListener('input', (e) => {
    state.videoUri = e.target.value;
    fullUpdate();
  });

  videoDurationInput.addEventListener('input', (e) => {
    state.videoDurationMs = parseInt(e.target.value) || 0;
    fullUpdate();
  });

  // Project size
  projectScaleSelect.addEventListener('change', () => {
    fullUpdate();
  });

  // Aspect ratio link/unlink
  aspectLinkBtn.addEventListener('click', () => {
    state.aspectLocked = !state.aspectLocked;
    aspectLinkBtn.classList.toggle('active', state.aspectLocked);

    if (state.aspectLocked) {
      // Re-linking: snap height to 4:5 ratio based on current width
      state.solidHeight = state.solidWidth * 5 / 4;
      solidHeightInput.value = state.solidHeight;
      aspectHint.textContent = 'Ratio locked at 4:5';
    } else {
      aspectHint.textContent = 'Ratio unlocked — free size';
    }
    fullUpdate();
  });

  // Solid width
  solidWidthInput.addEventListener('input', () => {
    const w = parseFloat(solidWidthInput.value);
    if (!isNaN(w) && w > 0) {
      state.solidWidth = w;
      if (state.aspectLocked) {
        state.solidHeight = w * 5 / 4;
        solidHeightInput.value = state.solidHeight;
      }
      fullUpdate();
    }
  });

  // Solid height
  solidHeightInput.addEventListener('input', () => {
    const h = parseFloat(solidHeightInput.value);
    if (!isNaN(h) && h > 0) {
      state.solidHeight = h;
      if (state.aspectLocked) {
        state.solidWidth = h * 4 / 5;
        solidWidthInput.value = state.solidWidth;
      }
      fullUpdate();
    }
  });

  // Solid color
  solidColorInput.addEventListener('input', () => {
    state.solidColor = solidColorInput.value;
    colorValueSpan.textContent = solidColorInput.value;
    fullUpdate();
  });

  // Wipe angle
  if (wipeAngleInput) {
    wipeAngleInput.addEventListener('input', () => {
      state.wipeAngle = parseInt(wipeAngleInput.value);
      wipeAngleValue.textContent = state.wipeAngle + '°';
      fullUpdate();
    });
  }

  // Wipe softness
  if (wipeSoftnessInput) {
    wipeSoftnessInput.addEventListener('input', () => {
      state.wipeSoftness = parseInt(wipeSoftnessInput.value);
      wipeSoftnessValue.textContent = state.wipeSoftness;
      fullUpdate();
    });
  }

  // Animation & Timing
  projectDurationInput.addEventListener('input', () => {
    state.projectDurationStr = projectDurationInput.value;
    fullUpdate();
  });
  projectFpsInput.addEventListener('input', () => {
    state.fps = parseInt(projectFpsInput.value) || 60;
    fullUpdate();
  });
  beat1Input.addEventListener('input', () => {
    state.beat1Str = beat1Input.value;
    fullUpdate();
  });
  beat2Input.addEventListener('input', () => {
    state.beat2Str = beat2Input.value;
    fullUpdate();
  });
  beat3Input.addEventListener('input', () => {
    state.beat3Str = beat3Input.value;
    fullUpdate();
  });
  animTypeToggleGroup.addEventListener('click', (e) => {
    const btn = e.target.closest('.toggle-btn');
    if (!btn) return;
    animTypeToggleGroup.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.animType = btn.dataset.value;
    showToast('Experimental feature — animation types are still in development.');

    // Show/hide Box controls
    if (boxEffectControls) {
      boxEffectControls.style.display = state.animType === 'box' ? 'block' : 'none';
    }
    if (globalTimingControls) {
      globalTimingControls.style.display = state.animType === 'box' ? 'none' : 'block';
    }

    renderSectionsUI();
    fullUpdate();
  });
  flipPivotXInput.addEventListener('input', () => {
    state.flipPivotX = parseFloat(flipPivotXInput.value) || 0;
    fullUpdate();
  });
  flipPivotYInput.addEventListener('input', () => {
    state.flipPivotY = parseFloat(flipPivotYInput.value) || 0;
    fullUpdate();
  });

  function setSectionCount(val) {
    if (val < 1) val = 1;
    if (val > 10) val = 10;
    state.sectionCount = val;
    sectionCountInput.value = val;
    
    while (state.sections.length < val) {
      const last = state.sections[state.sections.length - 1];
      const newSec = { ...last };
      if (last.subSections) {
        newSec.subSections = last.subSections.map(sub => ({ ...sub }));
      }
      state.sections.push(newSec);
    }
    while (state.sections.length > val) {
      state.sections.pop();
    }
    
    renderSectionsUI();
    fullUpdate();
  }

  sectionCountInput.addEventListener('input', () => {
    setSectionCount(parseInt(sectionCountInput.value) || 1);
  });
  sectionMinusBtn.addEventListener('click', () => setSectionCount(state.sectionCount - 1));
  sectionPlusBtn.addEventListener('click', () => setSectionCount(state.sectionCount + 1));

  // Modal and Graph Message Listener
  let currentEditingTarget = 'global'; // 'global', 'box-orient', 'box-rotate', or 'sub-section-X-Y'

  openGraphBtn.addEventListener('click', () => {
    currentEditingTarget = 'global';
    graphIframe.style.display = 'block';
    graphIframe2.style.display = 'none';
    graphModal.style.display = 'flex';
    const parts = state.flipEasing.split(',').map(Number);
    if (parts.length === 4 && graphIframe.contentWindow) {
      try {
        graphIframe.contentWindow.postMessage({
          type: 'SET_BEZIER',
          x1: parts[0], y1: parts[1], x2: parts[2], y2: parts[3]
        }, '*');
      } catch (err) {}
    }
  });
  
  closeGraphBtn.addEventListener('click', () => {
    graphModal.style.display = 'none';
  });

  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'BEZIER_UPDATE') {
      const { x1, y1, x2, y2 } = event.data;
      const easingStr = `${x1.toFixed(6)}, ${y1.toFixed(6)}, ${x2.toFixed(6)}, ${y2.toFixed(6)}`;
      
      if (currentEditingTarget === 'global') {
        state.flipEasing = easingStr;
      } else if (currentEditingTarget === 'box-orient') {
        state.box.orientEasing = easingStr;
      } else if (currentEditingTarget === 'box-rotate') {
        state.box.rotateEasing = easingStr;
      } else if (currentEditingTarget.startsWith('section-move-')) {
        const secIdx = parseInt(currentEditingTarget.replace('section-move-', ''));
        if (state.sections[secIdx]) {
          state.sections[secIdx].moveEasing = easingStr;
          const label = document.querySelector(`.section-block[data-index="${secIdx}"] .sec-move-curve-label`);
          if (label) label.textContent = easingStr;
        }
      } else if (currentEditingTarget.startsWith('sub-section-')) {
        const parts = currentEditingTarget.replace('sub-section-', '').split('-').map(Number);
        const secIdx = parts[0];
        const subIdx = parts[1];
        if (state.sections[secIdx] && state.sections[secIdx].subSections[subIdx]) {
          state.sections[secIdx].subSections[subIdx].easing = easingStr;
        }
      }
      fullUpdate();
    }
  });

  // Toggle XML Visibility
  let xmlVisible = false;
  toggleXmlBtn.addEventListener('click', () => {
    xmlVisible = !xmlVisible;
    xmlCodeContainer.style.display = xmlVisible ? 'block' : 'none';
    
    if (xmlVisible) {
      toggleXmlBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
      `;
      toggleXmlBtn.title = "Hide XML";
    } else {
      toggleXmlBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      `;
      toggleXmlBtn.title = "Show XML";
    }
  });

  // Copy XML
  copyXmlBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(generateAlightMotionXML());
      showToast('Copied XML to clipboard!');
    } catch (err) {
      // Fallback for browsers that don't support navigator.clipboard
      try {
        const textarea = document.createElement('textarea');
        textarea.value = generateAlightMotionXML();
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Copied XML to clipboard!');
      } catch (fallbackErr) {
        console.error("Fallback copy failed:", fallbackErr);
        showToast('Failed to copy XML.', true);
      }
    }
  });

  // ---- Settings Import/Export ----

  function deepMerge(target, source) {
    const isObject = (obj) => obj && typeof obj === 'object' && !Array.isArray(obj);

    // Create a new object to avoid modifying the original target state directly
    let output = { ...target };

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const sourceValue = source[key];
        const targetValue = target[key];

        // Recurse for nested objects
        if (isObject(targetValue) && isObject(sourceValue)) {
          output[key] = deepMerge(targetValue, sourceValue);
        }
        // Handle arrays: overwrite target array with source array
        // This is a simpler approach than deep-merging array elements, which can be complex.
        // It assumes the imported array is complete and valid.
        else if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
          output[key] = sourceValue;
        }
        // Handle primitive values
        else if (targetValue !== undefined && typeof targetValue === typeof sourceValue) {
          output[key] = sourceValue;
        }
        // Otherwise, ignore the key from the source to prevent pollution
      }
    }
    return output;
  }


  copySettingsBtn.addEventListener('click', () => {
    try {
      // Create a clean copy of the state for serialization
      const stateToSave = { ...state };
      // These are not useful to save as they are runtime-specific
      delete stateToSave.isPlaying;
      delete stateToSave.currentTimeSec;

      const settingsString = JSON.stringify(stateToSave);
      const encodedSettings = btoa(settingsString);
      navigator.clipboard.writeText(encodedSettings);
      showToast('Settings copied to clipboard!');
    } catch (error) {
      console.error("Error copying settings:", error);
      showToast('Error copying settings.', true);
    }
  });

  importSettingsBtn.addEventListener('click', () => {
    const encodedSettings = prompt("Paste your settings string below:");
    if (!encodedSettings || encodedSettings.trim() === '') return;

    try {
      const settingsString = atob(encodedSettings);
      const importedState = JSON.parse(settingsString);

      // Safely merge the imported state into the current state
      const newState = deepMerge(state, importedState);
      
      // Now, we need to re-assign the new properties back to the original state object
      // This preserves the original state object reference, which is important for the app.
      Object.keys(newState).forEach(key => {
        state[key] = newState[key];
      });

      // Refresh UI with new values from the merged state
      updateUIFromState();
      
      showToast('Settings imported successfully!');
    } catch (error) {
      console.error("Error importing settings:", error);
      showToast('Invalid or corrupted settings string.', true);
    }
  });

  function updateUIFromState() {
    // Update all input fields and UI elements to reflect the current state
    projectScaleSelect.value = state.projectWidth / state.baseWidth;
    solidWidthInput.value = state.solidWidth;
    solidHeightInput.value = state.solidHeight;
    aspectLinkBtn.classList.toggle('active', state.aspectLocked);
    solidColorInput.value = state.solidColor;
    colorValueSpan.textContent = state.solidColor;
    
    document.querySelector(`#splitDirection .toggle-btn[data-value='${state.splitDirection}']`).click();
    if (wipeMethodToggleGroup) {
      const wBtn = wipeMethodToggleGroup.querySelector(`.toggle-btn[data-value='${state.wipeMethod || 'mask'}']`);
      if (wBtn) {
        wipeMethodToggleGroup.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        wBtn.classList.add('active');
      }
    }
    if (maskingOptions) {
      maskingOptions.style.display = state.wipeMethod === 'mask' ? 'block' : 'none';
    }
    if (maskGroupToggle) {
      const gVal = state.maskEmbedScene !== false ? 'embed' : 'direct';
      const gBtn = maskGroupToggle.querySelector(`.toggle-btn[data-value='${gVal}']`);
      if (gBtn) {
        maskGroupToggle.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        gBtn.classList.add('active');
      }
    }
    syncVideoLayerUI();
    
    projectDurationInput.value = state.projectDurationStr;
    projectFpsInput.value = state.fps;
    beat1Input.value = state.beat1Str;
    beat2Input.value = state.beat2Str;
    beat3Input.value = state.beat3Str;

    document.querySelector(`#animTypeToggle .toggle-btn[data-value='${state.animType}']`).click();
    
    flipPivotXInput.value = state.flipPivotX;
    flipPivotYInput.value = state.flipPivotY;

    // Box controls
    boxOrientAllStartInput.value = state.box.orientAllStartStr;
    boxOrientFirstEndInput.value = state.box.orientFirstEndStr;
    boxOrientLastEndInput.value = state.box.orientLastEndStr;
    boxOrientStartXInput.value = state.box.orientStartX;
    boxOrientStartYInput.value = state.box.orientStartY;
    boxOrientStartZInput.value = state.box.orientStartZ;
    boxOrientEndXInput.value = state.box.orientEndX;
    boxOrientEndYInput.value = state.box.orientEndY;
    boxOrientEndZInput.value = state.box.orientEndZ;
    boxRotateAllStartInput.value = state.box.rotateAllStartStr;
    boxRotateFirstEndInput.value = state.box.rotateFirstEndStr;
    boxRotateLastEndInput.value = state.box.rotateLastEndStr;
    boxRotateStartXInput.value = state.box.rotateStartX;
    boxRotateStartYInput.value = state.box.rotateStartY;
    boxRotateStartZInput.value = state.box.rotateStartZ;
    boxRotateEndXInput.value = state.box.rotateEndX;
    boxRotateEndYInput.value = state.box.rotateEndY;
    boxRotateEndZInput.value = state.box.rotateEndZ;

    sectionCountInput.value = state.sectionCount;

    // This will re-render the sections and sub-sections, which is crucial
    renderSectionsUI(); 
    // Finally, do a full update to recalculate everything and redraw the canvas
    fullUpdate();
  }

  // Download XML
  downloadXmlBtn.addEventListener('click', () => {
    const layers = calculateLayers();
    const xml = generateAlightMotionXML();
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wipe-layers-${layers.length}x-${state.projectWidth}x${state.projectHeight}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded XML!');
  });

  // Box Control Handlers
  if (boxEffectControls) {
    boxOrientAllStartInput.addEventListener('input', () => { state.box.orientAllStartStr = boxOrientAllStartInput.value; fullUpdate(); });
    boxOrientFirstEndInput.addEventListener('input', () => { state.box.orientFirstEndStr = boxOrientFirstEndInput.value; fullUpdate(); });
    boxOrientLastEndInput.addEventListener('input', () => { state.box.orientLastEndStr = boxOrientLastEndInput.value; fullUpdate(); });
    boxOrientStartXInput.addEventListener('input', () => { state.box.orientStartX = parseFloat(boxOrientStartXInput.value) || 0; fullUpdate(); });
    boxOrientStartYInput.addEventListener('input', () => { state.box.orientStartY = parseFloat(boxOrientStartYInput.value) || 0; fullUpdate(); });
    boxOrientStartZInput.addEventListener('input', () => { state.box.orientStartZ = parseFloat(boxOrientStartZInput.value) || 0; fullUpdate(); });
    boxOrientEndXInput.addEventListener('input', () => { state.box.orientEndX = parseFloat(boxOrientEndXInput.value) || 0; fullUpdate(); });
    boxOrientEndYInput.addEventListener('input', () => { state.box.orientEndY = parseFloat(boxOrientEndYInput.value) || 0; fullUpdate(); });
    boxOrientEndZInput.addEventListener('input', () => { state.box.orientEndZ = parseFloat(boxOrientEndZInput.value) || 0; fullUpdate(); });
    
    boxRotateAllStartInput.addEventListener('input', () => { state.box.rotateAllStartStr = boxRotateAllStartInput.value; fullUpdate(); });
    boxRotateFirstEndInput.addEventListener('input', () => { state.box.rotateFirstEndStr = boxRotateFirstEndInput.value; fullUpdate(); });
    boxRotateLastEndInput.addEventListener('input', () => { state.box.rotateLastEndStr = boxRotateLastEndInput.value; fullUpdate(); });
    boxRotateStartXInput.addEventListener('input', () => { state.box.rotateStartX = parseFloat(boxRotateStartXInput.value) || 0; fullUpdate(); });
    boxRotateStartYInput.addEventListener('input', () => { state.box.rotateStartY = parseFloat(boxRotateStartYInput.value) || 0; fullUpdate(); });
    boxRotateStartZInput.addEventListener('input', () => { state.box.rotateStartZ = parseFloat(boxRotateStartZInput.value) || 0; fullUpdate(); });
    boxRotateEndXInput.addEventListener('input', () => { state.box.rotateEndX = parseFloat(boxRotateEndXInput.value) || 0; fullUpdate(); });
    boxRotateEndYInput.addEventListener('input', () => { state.box.rotateEndY = parseFloat(boxRotateEndYInput.value) || 0; fullUpdate(); });
    boxRotateEndZInput.addEventListener('input', () => { state.box.rotateEndZ = parseFloat(boxRotateEndZInput.value) || 0; fullUpdate(); });

    boxOrientEasingBtn.addEventListener('click', () => {
      currentEditingTarget = 'box-orient';
      graphIframe.style.display = 'block';
      graphIframe2.style.display = 'none';
      graphModal.style.display = 'flex';
    });

    boxRotateEasingBtn.addEventListener('click', () => {
      currentEditingTarget = 'box-rotate';
      graphIframe.style.display = 'none';
      graphIframe2.style.display = 'block';
      graphModal.style.display = 'flex';
    });
  }

  // Window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => renderPreview(), 100);
  });

  // ---- Initialize ----
  if (wipeMethodToggleGroup) {
    const initBtn = wipeMethodToggleGroup.querySelector(`.toggle-btn[data-value='${state.wipeMethod}']`);
    if (initBtn) {
      wipeMethodToggleGroup.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
      initBtn.classList.add('active');
    }
  }
  if (maskingOptions) {
    maskingOptions.style.display = state.wipeMethod === 'mask' ? 'block' : 'none';
  }
  renderSectionsUI();
  fullUpdate();

  // =========================================================================
  // MAIN APP TABS: Wipe Studio vs Media Converter
  // =========================================================================
  const navTabStudio = $('#navTabStudio');
  const navTabConverter = $('#navTabConverter');
  const controlsPanelElem = $('#controls-panel');
  const previewPanelElem = $('#preview-panel');
  const dataPanelElem = $('#data-panel');
  const converterPanelElem = $('#converter-panel');

  function switchMainTab(tabName) {
    if (tabName === 'converter') {
      if (navTabConverter) navTabConverter.classList.add('active');
      if (navTabStudio) navTabStudio.classList.remove('active');
      if (controlsPanelElem) controlsPanelElem.style.display = 'none';
      if (previewPanelElem) previewPanelElem.style.display = 'none';
      if (dataPanelElem) dataPanelElem.style.display = 'none';
      if (converterPanelElem) converterPanelElem.style.display = 'flex';
    } else {
      if (navTabStudio) navTabStudio.classList.add('active');
      if (navTabConverter) navTabConverter.classList.remove('active');
      if (controlsPanelElem) controlsPanelElem.style.display = '';
      if (previewPanelElem) previewPanelElem.style.display = '';
      if (dataPanelElem) dataPanelElem.style.display = '';
      if (converterPanelElem) converterPanelElem.style.display = 'none';
      renderPreview();
    }
  }

  if (navTabStudio) {
    navTabStudio.addEventListener('click', () => switchMainTab('studio'));
  }
  if (navTabConverter) {
    navTabConverter.addEventListener('click', () => switchMainTab('converter'));
  }

  // =========================================================================
  // XML MEDIA LAYER CONVERTER ENGINE
  // =========================================================================
  const converterState = {
    originalXml: '',
    transformedXml: '',
    filename: '',
    xmlDoc: null,
    layers: [],
    mediaType: 'image/png',
    mediaUri: 'am-internal:///79E80CB55B8662B05AFDC24DB42B814BC455410A.PNG',
    maskSlicing: 'connect',
    filterQuery: '',
  };

  // Converter DOM Elements
  const btnDownloadConvertedXml = $('#btnDownloadConvertedXml');
  const btnCopyConvertedXml     = $('#btnCopyConvertedXml');
  const btnCopyInlineXml        = $('#btnCopyInlineXml');
  const xmlDropzone             = $('#xmlDropzone');
  const xmlFileInput            = $('#xmlFileInput');
  const btnBrowseXml            = $('#btnBrowseXml');
  const btnPasteXmlModal        = $('#btnPasteXmlModal');
  const btnLoadSample349        = $('#btnLoadSample349');
  const btnLoadSample294        = $('#btnLoadSample294');
  const btnLoadStudioXml        = $('#btnLoadStudioXml');
  const fileMetaBanner          = $('#fileMetaBanner');
  const metaFileName            = $('#metaFileName');
  const metaFileShapesCount     = $('#metaFileShapesCount');
  const metaDimensions          = $('#metaDimensions');
  const metaFps                 = $('#metaFps');
  const metaDuration            = $('#metaDuration');
  const mediaTypeToggle         = $('#mediaTypeToggle');
  const maskSlicingToggle       = $('#maskSlicingToggle');
  const targetMediaUri          = $('#targetMediaUri');
  const btnSelectAllLayers      = $('#btnSelectAllLayers');
  const btnDeselectAllLayers    = $('#btnDeselectAllLayers');
  const btnInvertSelection      = $('#btnInvertSelection');
  const selectedCountText       = $('#selectedCountText');
  const totalCountText          = $('#totalCountText');
  const layerSearchInput        = $('#layerSearchInput');
  const layersEmptyState        = $('#layersEmptyState');
  const converterLayersList     = $('#converterLayersList');
  const convertedXmlCode        = $('#convertedXmlCode');

  // Paste XML Modal
  const pasteXmlModal           = $('#pasteXmlModal');
  const pasteXmlTextarea        = $('#pasteXmlTextarea');
  const closePasteXmlBtn        = $('#closePasteXmlBtn');
  const cancelPasteXmlBtn       = $('#cancelPasteXmlBtn');
  const confirmPasteXmlBtn      = $('#confirmPasteXmlBtn');

  function escapeHtmlStr(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatXml(xml) {
    let formatted = '';
    let indent = 0;
    const tab = '  ';
    xml = xml.replace(/>\s*</g, '><');
    const nodes = xml.replace(/(>)(<)(\/*)/g, '$1\r\n$2$3').split('\r\n');
    for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i].trim();
      if (!node) continue;
      if (node.match(/^<\/\w/)) {
        indent = Math.max(0, indent - 1);
      }
      formatted += tab.repeat(indent) + node + '\n';
      if (node.match(/^<\w[^>]*[^\/]>.*$/) && !node.includes('</') && !node.startsWith('<?')) {
        indent++;
      }
    }
    return formatted.trim();
  }

  function updateMediaTypeToggleUI() {
    if (!mediaTypeToggle) return;
    mediaTypeToggle.querySelectorAll('.toggle-btn').forEach(btn => {
      if (btn.dataset.value === converterState.mediaType) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function updateMaskSlicingToggleUI() {
    if (!maskSlicingToggle) return;
    maskSlicingToggle.querySelectorAll('.toggle-btn').forEach(btn => {
      if (btn.dataset.value === converterState.maskSlicing) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function loadXmlString(xmlString, filename = 'project.xml') {
    try {
      const cleanXml = xmlString.trim();
      if (!cleanXml) {
        showToast('Empty XML provided');
        return;
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(cleanXml, 'text/xml');
      const parseError = doc.querySelector('parsererror');
      if (parseError) {
        showToast('XML Syntax Error: Could not parse XML');
        return;
      }

      const rootScene = doc.querySelector('scene');
      if (!rootScene) {
        showToast('Invalid Alight Motion XML: Missing <scene> tag');
        return;
      }

      converterState.originalXml = cleanXml;
      converterState.filename = filename;
      converterState.xmlDoc = doc;

      // Extract metadata
      const width = rootScene.getAttribute('width') || '1080';
      const height = rootScene.getAttribute('height') || '1350';
      const fps = rootScene.getAttribute('fps') || '60';
      const totalTime = parseInt(rootScene.getAttribute('totalTime') || '0', 10);
      const durationSec = (totalTime && fps) ? (totalTime / parseFloat(fps)).toFixed(2) + 's' : 'Dynamic';

      // Detect existing media tag
      const existingMedia = rootScene.querySelector(':scope > media') || doc.querySelector('media');
      if (existingMedia) {
        const existingUri = existingMedia.getAttribute('uri');
        const existingType = existingMedia.getAttribute('type');
        if (existingUri && existingUri.startsWith('am-internal:///')) {
          converterState.mediaUri = existingUri;
          if (targetMediaUri) targetMediaUri.value = existingUri;
        }
        if (existingType) {
          converterState.mediaType = existingType;
          updateMediaTypeToggleUI();
        }
      }

      // Discover all shape layers, excluding mask stencils with blending="mask"
      const allShapes = Array.from(doc.querySelectorAll('shape'));
      const shapeElements = allShapes.filter(s => s.getAttribute('blending') !== 'mask');

      converterState.layers = shapeElements.map((shape, idx) => {
        const id = shape.getAttribute('id') || String(idx + 1);
        const rawLabel = shape.getAttribute('label') || `Shape ${id}`;
        const shapeType = shape.getAttribute('s') || '.rect';
        const fillType = shape.getAttribute('fillType') || 'color';
        const fillImage = shape.getAttribute('fillImage') || '';
        const fillVideo = shape.getAttribute('fillVideo') || '';

        // Check if inside an embedScene Group & Mask
        const parentScene = shape.parentElement && shape.parentElement.tagName.toLowerCase() === 'scene' ? shape.parentElement : null;
        const parentEmbed = parentScene && parentScene.parentElement && parentScene.parentElement.tagName.toLowerCase() === 'embedScene' ? parentScene.parentElement : null;
        const isInsideMaskEmbed = parentScene && parentScene.querySelector('shape[blending="mask"]');

        let displayLabel = rawLabel;
        if (parentEmbed) {
          const embedLabel = parentEmbed.getAttribute('label') || '';
          if (embedLabel && !displayLabel.includes(embedLabel)) {
            displayLabel = `${embedLabel} (${rawLabel})`;
          }
        }

        // Color extraction
        const fillColElem = shape.querySelector('fillColor');
        const rawHex = fillColElem ? fillColElem.getAttribute('value') : null;
        let displayColor = '#64e4dc';
        if (rawHex) {
          if (rawHex.length === 9 && rawHex.startsWith('#')) {
            displayColor = '#' + rawHex.slice(3);
          } else {
            displayColor = rawHex;
          }
        }

        // Effects summary
        const effectNodes = Array.from(shape.querySelectorAll('effect'));
        if (parentEmbed) {
          effectNodes.push(...Array.from(parentEmbed.querySelectorAll(':scope > effect')));
        }
        const effects = effectNodes.map(e => {
          const effId = e.getAttribute('id') || '';
          return effId.replace(/^com\.alightcreative\.effects\./, '');
        }).filter(Boolean);

        if (isInsideMaskEmbed) {
          effects.unshift('Group & Mask');
        }

        const isMedia = fillType === 'media' || Boolean(fillImage) || Boolean(fillVideo);

        return {
          index: idx,
          id,
          label: displayLabel,
          shapeType,
          element: shape,
          parentEmbed,
          isInsideMaskEmbed: Boolean(isInsideMaskEmbed),
          originalFillType: fillType,
          originalFillImage: fillImage,
          originalFillVideo: fillVideo,
          originalColor: rawHex || '#FF4B8ED2',
          displayColor,
          effects,
          isMedia,
        };
      });

      if (metaFileName) metaFileName.textContent = filename;
      if (metaFileShapesCount) metaFileShapesCount.textContent = `${converterState.layers.length} Shape${converterState.layers.length === 1 ? '' : 's'}`;
      if (metaDimensions) metaDimensions.textContent = `${width} × ${height}`;
      if (metaFps) metaFps.textContent = `${fps} FPS`;
      if (metaDuration) metaDuration.textContent = durationSec;
      if (fileMetaBanner) fileMetaBanner.style.display = 'block';

      renderConverterLayers();
      updateTransformedXmlOutput();
      showToast(`Loaded ${converterState.layers.length} shapes from ${filename}`);
    } catch (err) {
      console.error('Error loading XML:', err);
      showToast('Error loading XML: ' + err.message);
    }
  }

  function renderConverterLayers() {
    if (!converterLayersList) return;

    if (!converterState.layers || converterState.layers.length === 0) {
      if (layersEmptyState) layersEmptyState.style.display = 'flex';
      converterLayersList.style.display = 'none';
      if (selectedCountText) selectedCountText.textContent = '0';
      if (totalCountText) totalCountText.textContent = '0';
      return;
    }

    if (layersEmptyState) layersEmptyState.style.display = 'none';
    converterLayersList.style.display = 'flex';

    const filter = (converterState.filterQuery || '').trim().toLowerCase();
    let selectedCount = 0;

    converterLayersList.innerHTML = '';

    converterState.layers.forEach((layer, idx) => {
      if (layer.isMedia) selectedCount++;

      const match = !filter ||
        layer.label.toLowerCase().includes(filter) ||
        layer.id.toLowerCase().includes(filter) ||
        layer.effects.some(e => e.toLowerCase().includes(filter));

      if (!match) return;

      const card = document.createElement('div');
      card.className = `layer-item ${layer.isMedia ? 'selected-media' : ''}`;
      card.dataset.index = String(idx);

      const effectsSummary = layer.effects.length > 0
        ? layer.effects.slice(0, 3).join(', ')
        : 'base shape';

      card.innerHTML = `
        <div class="layer-item-left">
          <input type="checkbox" class="layer-checkbox" ${layer.isMedia ? 'checked' : ''} aria-label="Toggle ${escapeHtmlStr(layer.label)}">
          <span class="layer-id-badge">#${escapeHtmlStr(layer.id)}</span>
          <div class="layer-info">
            <div class="layer-title" title="${escapeHtmlStr(layer.label)}">${escapeHtmlStr(layer.label)}</div>
            <div class="layer-meta-info">${escapeHtmlStr(layer.shapeType)} · ${escapeHtmlStr(effectsSummary)}</div>
          </div>
        </div>
        <div class="layer-item-right">
          ${layer.isMedia
            ? `<span class="layer-status-pill media-pill">MEDIA</span>`
            : `<span class="layer-status-pill color-pill"><span class="color-dot" style="background:${layer.displayColor}"></span>COLOR</span>`
          }
          <button type="button" class="layer-toggle-btn ${layer.isMedia ? 'active' : ''}">
            ${layer.isMedia ? 'Media ✓' : 'Make Media'}
          </button>
        </div>
      `;

      card.addEventListener('click', (e) => {
        if (e.target.classList.contains('layer-checkbox')) {
          layer.isMedia = e.target.checked;
        } else {
          layer.isMedia = !layer.isMedia;
        }
        renderConverterLayers();
        updateTransformedXmlOutput();
      });

      converterLayersList.appendChild(card);
    });

    if (selectedCountText) selectedCountText.textContent = String(selectedCount);
    if (totalCountText) totalCountText.textContent = String(converterState.layers.length);
  }

  function updateTransformedXmlOutput() {
    if (!converterState.xmlDoc) {
      if (convertedXmlCode) convertedXmlCode.textContent = '<!-- Import an XML to preview transformed output -->';
      return;
    }

    const doc = converterState.xmlDoc.cloneNode(true);
    const rootScene = doc.querySelector('scene');
    if (!rootScene) return;

    const mediaUri = (converterState.mediaUri || '').trim() || 'am-internal:///79E80CB55B8662B05AFDC24DB42B814BC455410A.PNG';
    const mediaType = converterState.mediaType || 'image/png';
    const isVideo = mediaType.startsWith('video');

    // Discover non-mask shapes corresponding 1-to-1 with converterState.layers
    const allShapes = Array.from(doc.querySelectorAll('shape'));
    const nonMaskShapes = allShapes.filter(s => s.getAttribute('blending') !== 'mask');
    let anyMedia = false;

    // Pass 1: Set media / color fill properties on selected shapes
    converterState.layers.forEach((layerState, idx) => {
      const shape = nonMaskShapes[idx];
      if (!shape) return;

      if (layerState.isMedia) {
        anyMedia = true;
        shape.setAttribute('fillType', 'media');
        if (isVideo) {
          shape.setAttribute('fillVideo', mediaUri);
          shape.removeAttribute('fillImage');
        } else {
          shape.setAttribute('fillImage', mediaUri);
          shape.removeAttribute('fillVideo');
        }
        shape.setAttribute('mediaFillMode', 'fill');

        const fillCol = shape.querySelector('fillColor');
        if (fillCol) {
          shape.removeChild(fillCol);
        }
      } else {
        shape.setAttribute('fillType', 'color');
        shape.removeAttribute('fillImage');
        shape.removeAttribute('fillVideo');
        shape.removeAttribute('mediaFillMode');

        let fillCol = shape.querySelector('fillColor');
        if (!fillCol) {
          fillCol = doc.createElement('fillColor');
          fillCol.setAttribute('value', layerState.originalColor || '#FF4B8ED2');
          shape.appendChild(fillCol);
        }
      }
    });

    // Pass 2: Connected Masking Mode alignment
    // If maskSlicing === 'connect', ensure any standalone mask slices (no wipe2, no blending="mask" sibling)
    // are wrapped into an <embedScene fillType="intrinsic"> Group & Mask with offset media and stencil.
    if (converterState.maskSlicing === 'connect') {
      const standaloneSlices = [];

      converterState.layers.forEach((layerState, idx) => {
        if (!layerState.isMedia) return;
        const shape = nonMaskShapes[idx];
        if (!shape) return;

        // If shape already has wipe2, it slices the media natively
        if (shape.querySelector('effect[id="com.alightcreative.effects.wipe2"]')) return;

        // If shape is already inside an embedScene with a sibling blending="mask" stencil, it's already Group & Mask
        const pScene = shape.parentElement && shape.parentElement.tagName.toLowerCase() === 'scene' ? shape.parentElement : null;
        if (pScene && pScene.querySelector('shape[blending="mask"]')) return;

        // Skip background reference shapes like "Rectangle to fit"
        const lbl = (shape.getAttribute('label') || '').toLowerCase();
        if (lbl.includes('to fit') || lbl.includes('reference')) return;

        // Extract location and tile dimensions
        const locElem = shape.querySelector('transform > location');
        const scaleElem = shape.querySelector('transform > scale');
        const sizeElem = shape.querySelector('property[name="size"]');

        let lx = 0, ly = 0;
        if (locElem && locElem.getAttribute('value')) {
          const parts = locElem.getAttribute('value').split(',').map(Number);
          lx = parts[0] || 0;
          ly = parts[1] || 0;
        }

        let tw = 0, th = 0;
        if (scaleElem && scaleElem.getAttribute('value')) {
          const parts = scaleElem.getAttribute('value').split(',').map(Number);
          tw = (parts[0] || 1) * 200.0;
          th = (parts[1] || 1) * 200.0;
        } else if (sizeElem && sizeElem.getAttribute('value')) {
          const parts = sizeElem.getAttribute('value').split(',').map(Number);
          tw = (parts[0] || 0) * 2.0;
          th = (parts[1] || 0) * 2.0;
        }

        if (tw > 0 && th > 0) {
          standaloneSlices.push({
            shape,
            lx, ly, tw, th,
            minX: lx - tw / 2.0,
            maxX: lx + tw / 2.0,
            minY: ly - th / 2.0,
            maxY: ly + th / 2.0,
          });
        }
      });

      if (standaloneSlices.length > 0) {
        // Calculate bounding box of the composite image to slice
        let fullW = 0, fullH = 0, originX = 0, originY = 0;

        const refFitShape = doc.querySelector('shape[label*="to fit"], shape[label*="Rectangle to fit"]');
        if (refFitShape) {
          const rLoc = refFitShape.querySelector('transform > location');
          const rScale = refFitShape.querySelector('transform > scale');
          if (rLoc && rScale) {
            const lp = rLoc.getAttribute('value').split(',').map(Number);
            const sp = rScale.getAttribute('value').split(',').map(Number);
            originX = lp[0] || 0;
            originY = lp[1] || 0;
            fullW = (sp[0] || 1) * 200.0;
            fullH = (sp[1] || 1) * 200.0;
          }
        }

        if (fullW === 0 || fullH === 0) {
          const minX = Math.min(...standaloneSlices.map(s => s.minX));
          const maxX = Math.max(...standaloneSlices.map(s => s.maxX));
          const minY = Math.min(...standaloneSlices.map(s => s.minY));
          const maxY = Math.max(...standaloneSlices.map(s => s.maxY));
          fullW = maxX - minX;
          fullH = maxY - minY;
          originX = minX + (fullW / 2.0);
          originY = minY + (fullH / 2.0);
        }

        const rootTotalTime = rootScene.getAttribute('totalTime') || '3000';
        const rootFps = rootScene.getAttribute('fps') || '60';

        standaloneSlices.forEach(item => {
          const s = item.shape;
          const parent = s.parentNode;
          if (!parent) return;

          const cx = item.tw / 2.0;
          const cy = item.th / 2.0;
          const mediaLocX = cx + (originX - item.lx);
          const mediaLocY = cy + (originY - item.ly);

          const sId = s.getAttribute('id') || '1';
          const sLabel = s.getAttribute('label') || `Slice ${sId}`;
          const sStartTime = s.getAttribute('startTime') || '0';
          const sEndTime = s.getAttribute('endTime') || rootTotalTime;

          const es = doc.createElement('embedScene');
          es.setAttribute('id', sId);
          es.setAttribute('label', sLabel);
          es.setAttribute('startTime', sStartTime);
          es.setAttribute('endTime', sEndTime);
          es.setAttribute('fillType', 'intrinsic');

          // Outer transform (preserves movement keyframes/location, sets scale to 1.0)
          const origTransform = s.querySelector('transform');
          if (origTransform) {
            const clonedTransform = origTransform.cloneNode(true);
            const scaleNode = clonedTransform.querySelector('scale');
            if (scaleNode) {
              scaleNode.setAttribute('value', '1.000000,1.000000');
            }
            es.appendChild(clonedTransform);
          }

          // Outer effects (flip3, cube2, box, etc.)
          const origEffects = Array.from(s.querySelectorAll('effect'));
          origEffects.forEach(eff => es.appendChild(eff.cloneNode(true)));

          const fc = doc.createElement('fillColor');
          fc.setAttribute('value', '#FF000000');
          es.appendChild(fc);

          // Inner Scene
          const sc = doc.createElement('scene');
          sc.setAttribute('title', '');
          sc.setAttribute('width', String(Math.round(item.tw)));
          sc.setAttribute('height', String(Math.round(item.th)));
          sc.setAttribute('exportWidth', String(Math.round(item.tw)));
          sc.setAttribute('exportHeight', String(Math.round(item.th)));
          sc.setAttribute('bgcolor', '#00000000');
          sc.setAttribute('totalTime', sEndTime);
          sc.setAttribute('fps', rootFps);
          sc.setAttribute('modifiedTime', '0');
          sc.setAttribute('amver', '868');
          sc.setAttribute('ffver', '107');
          sc.setAttribute('am', 'com.alightcreative.motion/6.2.59');
          sc.setAttribute('amplatform', 'ios');
          sc.setAttribute('precompose', 'dynamicResolution');
          sc.setAttribute('retime', 'off');

          // Inner Shape 1: Offset full media
          const sh1 = doc.createElement('shape');
          sh1.setAttribute('id', '1');
          sh1.setAttribute('label', `${sLabel} Media`);
          sh1.setAttribute('startTime', '0');
          sh1.setAttribute('endTime', sEndTime);
          sh1.setAttribute('fillType', 'media');
          if (isVideo) {
            sh1.setAttribute('fillVideo', mediaUri);
          } else {
            sh1.setAttribute('fillImage', mediaUri);
          }
          sh1.setAttribute('mediaFillMode', 'fill');
          sh1.setAttribute('s', '.rect');

          const sh1Trans = doc.createElement('transform');
          const sh1Loc = doc.createElement('location');
          sh1Loc.setAttribute('value', `${mediaLocX.toFixed(6)},${mediaLocY.toFixed(6)},0.000000`);
          sh1Trans.appendChild(sh1Loc);
          sh1.appendChild(sh1Trans);

          const sh1Size = doc.createElement('property');
          sh1Size.setAttribute('name', 'size');
          sh1Size.setAttribute('type', 'vec2');
          sh1Size.setAttribute('value', `${(fullW / 2.0).toFixed(6)},${(fullH / 2.0).toFixed(6)}`);
          sh1.appendChild(sh1Size);

          sc.appendChild(sh1);

          // Inner Shape 2: Mask stencil
          const sh2 = doc.createElement('shape');
          sh2.setAttribute('id', '2');
          sh2.setAttribute('label', `${sLabel} Mask`);
          sh2.setAttribute('startTime', '0');
          sh2.setAttribute('endTime', sEndTime);
          sh2.setAttribute('fillType', 'color');
          sh2.setAttribute('blending', 'mask');
          sh2.setAttribute('s', '.rect');

          const sh2Trans = doc.createElement('transform');
          const sh2Loc = doc.createElement('location');
          sh2Loc.setAttribute('value', `${cx.toFixed(6)},${cy.toFixed(6)},0.000000`);
          const sh2Scale = doc.createElement('scale');
          sh2Scale.setAttribute('value', `${(item.tw / 200.0).toFixed(6)},${(item.th / 200.0).toFixed(6)}`);
          sh2Trans.appendChild(sh2Loc);
          sh2Trans.appendChild(sh2Scale);
          sh2.appendChild(sh2Trans);

          const sh2Fc = doc.createElement('fillColor');
          sh2Fc.setAttribute('value', '#FFFFFFFF');
          sh2.appendChild(sh2Fc);

          sc.appendChild(sh2);
          es.appendChild(sc);

          // Drop-in replacement
          parent.replaceChild(es, s);
        });
      }
    }

    // Top-level <media> tag in root <scene>
    let mediaElem = rootScene.querySelector(':scope > media') || rootScene.querySelector('media');
    if (anyMedia) {
      if (!mediaElem) {
        mediaElem = doc.createElement('media');
        rootScene.insertBefore(mediaElem, rootScene.firstChild);
      }
      mediaElem.setAttribute('uri', mediaUri);
      mediaElem.setAttribute('type', mediaType);
      if (!mediaElem.getAttribute('width')) mediaElem.setAttribute('width', rootScene.getAttribute('width') || '1080');
      if (!mediaElem.getAttribute('height')) mediaElem.setAttribute('height', rootScene.getAttribute('height') || '1350');
      if (!mediaElem.getAttribute('infoUpdated')) mediaElem.setAttribute('infoUpdated', String(Date.now()));
    } else {
      if (mediaElem && mediaElem.getAttribute('uri') === mediaUri) {
        mediaElem.parentNode.removeChild(mediaElem);
      }
    }

    const serializer = new XMLSerializer();
    let xmlStr = serializer.serializeToString(doc);

    xmlStr = formatXml(xmlStr);
    if (!xmlStr.startsWith('<?xml')) {
      xmlStr = `<?xml version='1.0' encoding='UTF-8' ?>\n` + xmlStr;
    }

    converterState.transformedXml = xmlStr;
    if (convertedXmlCode) {
      convertedXmlCode.textContent = xmlStr;
    }
  }

  // Media Type Toggle
  if (mediaTypeToggle) {
    mediaTypeToggle.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        converterState.mediaType = btn.dataset.value;
        updateMediaTypeToggleUI();
        updateTransformedXmlOutput();
      });
    });
  }

  // Mask Slicing Alignment Toggle
  if (maskSlicingToggle) {
    maskSlicingToggle.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        converterState.maskSlicing = btn.dataset.value;
        updateMaskSlicingToggleUI();
        updateTransformedXmlOutput();
      });
    });
  }

  // Media URI Input
  if (targetMediaUri) {
    targetMediaUri.addEventListener('input', () => {
      converterState.mediaUri = targetMediaUri.value.trim();
      updateTransformedXmlOutput();
    });
  }

  // Batch actions
  if (btnSelectAllLayers) {
    btnSelectAllLayers.addEventListener('click', () => {
      if (!converterState.layers.length) return;
      converterState.layers.forEach(l => l.isMedia = true);
      renderConverterLayers();
      updateTransformedXmlOutput();
      showToast('All shapes converted to media layers');
    });
  }

  if (btnDeselectAllLayers) {
    btnDeselectAllLayers.addEventListener('click', () => {
      if (!converterState.layers.length) return;
      converterState.layers.forEach(l => l.isMedia = false);
      renderConverterLayers();
      updateTransformedXmlOutput();
      showToast('All shapes reset to solid color');
    });
  }

  if (btnInvertSelection) {
    btnInvertSelection.addEventListener('click', () => {
      if (!converterState.layers.length) return;
      converterState.layers.forEach(l => l.isMedia = !l.isMedia);
      renderConverterLayers();
      updateTransformedXmlOutput();
      showToast('Inverted layer selection');
    });
  }

  // Layer filter/search
  if (layerSearchInput) {
    layerSearchInput.addEventListener('input', () => {
      converterState.filterQuery = layerSearchInput.value;
      renderConverterLayers();
    });
  }

  // Quick Preset Loaders
  if (btnLoadSample349) {
    btnLoadSample349.addEventListener('click', () => {
      fetch('samples/Project_349.xml')
        .then(res => {
          if (!res.ok) throw new Error('File not found');
          return res.text();
        })
        .then(txt => loadXmlString(txt, 'Project Name 349.xml'))
        .catch(err => showToast('Could not load sample: ' + err.message));
    });
  }

  if (btnLoadSample294) {
    btnLoadSample294.addEventListener('click', () => {
      fetch('samples/Project_294.xml')
        .then(res => {
          if (!res.ok) throw new Error('File not found');
          return res.text();
        })
        .then(txt => loadXmlString(txt, 'Project Name 294.xml'))
        .catch(err => showToast('Could not load sample: ' + err.message));
    });
  }

  if (btnLoadStudioXml) {
    btnLoadStudioXml.addEventListener('click', () => {
      try {
        const layers = calculateLayers();
        const xml = generateAlightMotionXML(layers);
        loadXmlString(xml, `Studio-${state.wipeMethod}-${layers.length}L.xml`);
      } catch (err) {
        showToast('Could not generate studio XML: ' + err.message);
      }
    });
  }

  // File browse & drag-and-drop
  if (btnBrowseXml && xmlFileInput) {
    btnBrowseXml.addEventListener('click', () => xmlFileInput.click());
    xmlFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => loadXmlString(evt.target.result, file.name);
      reader.onerror = () => showToast('Error reading XML file');
      reader.readAsText(file);
      xmlFileInput.value = '';
    });
  }

  if (xmlDropzone) {
    xmlDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      xmlDropzone.classList.add('drag-over');
    });
    xmlDropzone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      xmlDropzone.classList.remove('drag-over');
    });
    xmlDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      xmlDropzone.classList.remove('drag-over');
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => loadXmlString(evt.target.result, file.name);
      reader.onerror = () => showToast('Error reading dropped XML file');
      reader.readAsText(file);
    });
  }

  // Paste XML Modal Handlers
  if (btnPasteXmlModal && pasteXmlModal) {
    btnPasteXmlModal.addEventListener('click', () => {
      if (pasteXmlTextarea) pasteXmlTextarea.value = '';
      pasteXmlModal.style.display = 'flex';
      if (pasteXmlTextarea) pasteXmlTextarea.focus();
    });
  }

  function closePasteModal() {
    if (pasteXmlModal) pasteXmlModal.style.display = 'none';
  }

  if (closePasteXmlBtn) closePasteXmlBtn.addEventListener('click', closePasteModal);
  if (cancelPasteXmlBtn) cancelPasteXmlBtn.addEventListener('click', closePasteModal);

  if (confirmPasteXmlBtn) {
    confirmPasteXmlBtn.addEventListener('click', () => {
      const text = pasteXmlTextarea ? pasteXmlTextarea.value.trim() : '';
      if (!text) {
        showToast('Please paste XML text first');
        return;
      }
      closePasteModal();
      loadXmlString(text, 'Pasted-Alight-Motion.xml');
    });
  }

  // Copy & Download Transformed XML
  function copyTransformedXml() {
    if (!converterState.transformedXml) {
      showToast('No XML loaded yet. Import an XML first!');
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(converterState.transformedXml)
        .then(() => showToast('Transformed XML copied to clipboard!'))
        .catch(() => fallbackCopy(converterState.transformedXml));
    } else {
      fallbackCopy(converterState.transformedXml);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('Transformed XML copied to clipboard!');
  }

  function downloadTransformedXml() {
    if (!converterState.transformedXml) {
      showToast('No XML loaded yet. Import an XML first!');
      return;
    }
    const blob = new Blob([converterState.transformedXml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const baseName = (converterState.filename || 'project').replace(/\.xml$/i, '');
    a.href = url;
    a.download = `${baseName}-media.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${a.download}!`);
  }

  if (btnCopyConvertedXml) btnCopyConvertedXml.addEventListener('click', copyTransformedXml);
  if (btnCopyInlineXml) btnCopyInlineXml.addEventListener('click', copyTransformedXml);
  if (btnDownloadConvertedXml) btnDownloadConvertedXml.addEventListener('click', downloadTransformedXml);

  // Auto-load sample preset on initial tab visit if empty
  if (navTabConverter) {
    navTabConverter.addEventListener('click', () => {
      if (!converterState.xmlDoc) {
        // Pre-load Project 349 so user immediately sees an interactive list of shapes
        fetch('samples/Project_349.xml')
          .then(res => res.ok ? res.text() : null)
          .then(txt => {
            if (txt && !converterState.xmlDoc) {
              loadXmlString(txt, 'Project Name 349.xml');
            }
          })
          .catch(() => {});
      }
    });
  }

  // ==========================================
  // MOBILE SHELL — DOM migration & tab switching
  // ==========================================
  (() => {
    const MOBILE_BREAKPOINT = 800;
    let isMobileLayout = false;

    // Desktop parent references (to restore nodes when going back to desktop)
    const controlsPanel = document.getElementById('controls-panel');
    const previewPanel  = document.getElementById('preview-panel');
    const dataPanel     = document.getElementById('data-panel');
    const converterPanel = document.getElementById('converter-panel');

    // Mobile slots
    const mobileConfigSlot    = document.getElementById('mobileConfigSlot');
    const mobilePreviewSlot   = document.getElementById('mobilePreviewSlot');
    const mobileDataSlot      = document.getElementById('mobileDataSlot');
    const mobileConverterSlot = document.getElementById('mobileConverterSlot');
    const mobileTabBar        = document.getElementById('mobileTabBar');

    if (!mobileConfigSlot || !mobilePreviewSlot || !mobileDataSlot || !mobileTabBar) return;

    // Elements to migrate
    const controlsBody      = controlsPanel ? controlsPanel.querySelector('.controls-body') : null;
    const canvasContainer   = document.getElementById('canvasContainer');
    const playbackControls  = previewPanel ? previewPanel.querySelector('.playback-controls') : null;
    const formulasCard      = document.getElementById('formulasCard');
    const tableContainer    = document.getElementById('tableContainer');
    const xmlSection        = dataPanel ? dataPanel.querySelector('.xml-section') : null;

    // Store original parent + nextSibling for clean restoration
    function saveOrigin(el) {
      if (el && !el._mobileOrigin) {
        el._mobileOrigin = { parent: el.parentNode, next: el.nextSibling };
      }
    }

    function restoreOrigin(el) {
      if (el && el._mobileOrigin) {
        const { parent, next } = el._mobileOrigin;
        if (next) {
          parent.insertBefore(el, next);
        } else {
          parent.appendChild(el);
        }
      }
    }

    // Save origins on first load
    [controlsBody, canvasContainer, playbackControls, formulasCard, tableContainer, xmlSection, converterPanel]
      .forEach(saveOrigin);

    function moveToMobile() {
      if (controlsBody) mobileConfigSlot.appendChild(controlsBody);
      if (canvasContainer) mobilePreviewSlot.appendChild(canvasContainer);
      if (playbackControls) mobilePreviewSlot.appendChild(playbackControls);
      if (formulasCard) mobilePreviewSlot.appendChild(formulasCard);
      if (tableContainer) mobileDataSlot.appendChild(tableContainer);
      if (xmlSection) mobileDataSlot.appendChild(xmlSection);
      if (converterPanel && mobileConverterSlot) {
        converterPanel.style.display = 'block';
        mobileConverterSlot.appendChild(converterPanel);
      }
    }

    function moveToDesktop() {
      [controlsBody, canvasContainer, playbackControls, formulasCard, tableContainer, xmlSection, converterPanel]
        .forEach(restoreOrigin);
      // Restore desktop active tab display
      const isConverterActive = navTabConverter && navTabConverter.classList.contains('active');
      if (isConverterActive) {
        switchMainTab('converter');
      } else {
        switchMainTab('studio');
      }
    }

    function checkLayout() {
      const shouldBeMobile = window.innerWidth <= MOBILE_BREAKPOINT;

      if (shouldBeMobile && !isMobileLayout) {
        isMobileLayout = true;
        moveToMobile();
        setTimeout(() => renderPreview(), 50);
      } else if (!shouldBeMobile && isMobileLayout) {
        isMobileLayout = false;
        moveToDesktop();
        setTimeout(() => renderPreview(), 50);
      }
    }

    // Tab switching
    const tabButtons = mobileTabBar.querySelectorAll('.mobile-tab');
    const tabContents = document.querySelectorAll('.mobile-tab-content');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-tab');

        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        tabContents.forEach(tc => tc.classList.remove('active'));
        const target = document.getElementById(targetId);
        if (target) target.classList.add('active');

        window.scrollTo(0, 0);

        if (targetId === 'mobileTabPreview') {
          setTimeout(() => renderPreview(), 50);
        }
      });
    });

    window.addEventListener('resize', () => {
      checkLayout();
    });

    checkLayout();
  })();

})();

