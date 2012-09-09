/**
 * Picture Mesh, it's cool yo!
 * DVNHNT Lab
 */
"use strict";

(function() {
  var root = this;
  
  /** Canvas Refs */
  var canvas = document.getElementById("mesh-canvas");
  var ctx = canvas.getContext("2d");
  var imgData;
  
  /** Mesh storage */
  var mesh;
  
  /** Triable color table */
  var triangles;
  
  /** Spring meshhh */
  var springs;
  
  /** Interactivity thingos*/
  var mouse = []
  mouse[0] = {x: 0, y:0 }
  mouse[1] = {x: 0, y:0 }
  mouse[2] = {x: 0, y:0 }
  mouse[3] = {x: 0, y:0 }
  
  var SPRING_K = .05;
  var MOUSE_FORCE = 1;
  var MOUSE_RAD = 20;
  
  var requestAnimFrame = (function(){
    return root.requestAnimationFrame   || 
      root.webkitRequestAnimationFrame  || 
      root.mozRequestAnimationFrame     || 
      root.oRequestAnimationFrame       || 
      root.msRequestAnimationFrame      || 
      function( callback ){
        root.setTimeout(callback, 1000 / 60);
      };
  })();

  /**
   * w - width of the mesh
   * h - height of the mesh
   * tw - triangle width
   * th - triangle height
   */
  function buildMesh(w, h, tw, th) {
    var dx = w / tw,
        dy = h / th;
    mesh = []
    
    for(var x = 0; x <= tw; x ++) {
      mesh[x] = []
      for(var y = 0; y <= th; y ++) {
        mesh[x][y] = {
          ox: x * dx, 
          oy: y * dy,
          x: x * dx, 
          y: y * dy,
          vx: 0,
          vy: 0,
          fx: 0,
          fy: 0,
          isPinned: false
        }
        
        if(x == 0 || x == tw || y == 0 || y == th) {
          mesh[x][y].isPinned = true;
        }
      }
    }
  }
  
  /**
   * Takes whatevers in the mesh and builds a triangle
   * table out of them
   */
  function buildTriangles(imgData) {
    var iw = imgData.width,
        ih = imgData.height,
        
        // pixel dimensions
        px, py, pw, ph, nudgex, nudgey,
        
        // colors and distances
        pcTL, pcTR, pcBL, pcBR, 
        ncTL, ncTR, ncBL, ncBR, 
        dTL, dTR, dBL, dBR;

    triangles = []
    
    for(var x = 0; x < mesh.length - 1; x ++) {
      for(var y = 0; y < mesh[x].length - 1; y ++) {
        
        pw = Math.floor(1 / mesh.length * iw);
        ph = Math.floor(1 / mesh[x].length * ih);
        px = pw * x;
        py = ph * y;
        nudgex = Math.floor(pw / 4);
        nudgey = Math.floor(ph / 4);
        
        
        // top left colors
        pcTL = getColor(imgData, px + nudgex, py + nudgey),
        ncTL = getColor(imgData, Math.max(0, px - nudgex), Math.max(0, py - nudgey));
        dTL = getColorDist(pcTL, ncTL);
        
        // top right colors
        pcTR = getColor(imgData, px + pw - nudgex, py + nudgey),
        ncTR = getColor(imgData, Math.max(0, px + pw + nudgex), Math.max(0, py - nudgey));
        dTR = getColorDist(pcTR, ncTR);
        
        // bottom left colors
        pcBL = getColor(imgData, px + nudgex, py + ph - nudgey),
        ncBL = getColor(imgData, Math.max(0, px - nudgex), Math.min(ih, py + pw + nudgey));
        dBL = getColorDist(pcBL, ncBL);
        
        // bottom right colors
        pcBR = getColor(imgData, px + pw - nudgex, py + ph - nudgey),
        ncBR = getColor(imgData, Math.min(iw, px + pw + nudgex), Math.min(ih, py + pw + nudgey));
        dBR = getColorDist(pcBR, ncBR);
        
        if(dTL + dBR < dTR + dBL) {
          triangles[triangles.length] = {
            a: mesh[x][y],
            b: mesh[x + 1][y],
            c: mesh[x][y + 1],
            color: cssColor(pcTL)
          }
          triangles[triangles.length] = {
            a: mesh[x + 1][y],
            b: mesh[x + 1][y + 1],
            c: mesh[x][y + 1],
            color: cssColor(pcBR)
          }
        } else {
          triangles[triangles.length] = {
            a: mesh[x][y],
            b: mesh[x + 1][y + 1],
            c: mesh[x][y + 1],
            color: cssColor(pcBL)
          }
          triangles[triangles.length] = {
            a: mesh[x][y],
            b: mesh[x + 1][y],
            c: mesh[x + 1][y + 1],
            color: cssColor(pcTR)
          }
        }
      }
    }
  }
  
  function getColor(imgData, x, y) {
    var w = imgData.width;
    return {
      r: imgData.data[(w * y + x + 4) * 4],
      g: imgData.data[(w * y + x + 4) * 4 + 1],
      b: imgData.data[(w * y + x + 4) * 4 + 2],
      a: imgData.data[(w * y + x + 4) * 4 + 3]
    };
  }
  
  function cssColor(color) {
    return "rgb(" + color.r + ", " + color.g + ", " + color.b + ")";
  }
  
  function getColorDist(c1, c2) {
    return (c1.r - c2.r) * (c1.r - c2.r) +
           (c1.g - c2.g) * (c1.g - c2.g) +
           (c1.b - c2.b) * (c1.b - c2.b);
  }
  
  function buildSprings() {
    springs = []
    for(var x = 0; x < mesh.length - 1; x ++) {
      for(var y = 0; y < mesh[x].length - 1; y ++) {
        springs[springs.length] = {
          a: mesh[x][y],
          b: mesh[x + 1][y],
          restLength: mesh[x + 1][y].x - mesh[x][y].x
        }
        springs[springs.length] = {
          a: mesh[x][y],
          b: mesh[x][y + 1],
          restLength: mesh[x][y + 1].y - mesh[x][y].y
        }
      }
    }
  }
  
  function getImageData(img) {
    var ic = document.createElement("canvas");
    ic.width = img.width;
    ic.height = img.height;
    var ictx = ic.getContext("2d");
    ictx.drawImage(img, 0, 0);
    
    return ictx.getImageData(0, 0, img.width, img.height);
  }
  
  function simulate() {
    var vert,
        spring,
        extent, 
        ex, ey, fx, fy, dx, dy,
        locx, locy, mfx, mfy, damp;
    
    // Spring solving
    for(var s = 0; s < springs.length; s ++) {
      spring = springs[s];
      ex = spring.b.x - spring.a.x;
      ey = spring.b.y - spring.a.y;
      extent = Math.sqrt(ex * ex + ey * ey);
      
      dx = ex / extent;
      dy = ey / extent;

      fx = dx * (extent - spring.restLength) * SPRING_K;
      fy = dy * (extent - spring.restLength) * SPRING_K;

      spring.a.fx += fx;
      spring.a.fy += fy;
      spring.b.fx += -fx;
      spring.b.fy += -fy;
    }
    
    locx = mouse[0].x;
    locy = mouse[0].y;
    mfx = (mouse[3].x - mouse[0].x) * MOUSE_FORCE;
    mfy = (mouse[3].y - mouse[0].y) * MOUSE_FORCE;

    for(var x = 0; x < mesh.length - 1; x ++) {
      for(var y = 0; y < mesh[x].length - 1; y ++) {
        vert = mesh[x][y];
        
        // Mouse Force
        extent = Math.sqrt((vert.x - locx) * (vert.x - locx) + (vert.y - locy) * (vert.y - locy));
        if(extent < MOUSE_RAD) {
          damp = (MOUSE_RAD - extent) / MOUSE_RAD;
          vert.fx += mfx * damp;
          vert.fy += mfy * damp;
        }
        
        // Euler Integration
        if(! vert.isPinned) {
          vert.vx += vert.fx;
          vert.vy += vert.fy;
          
          vert.x += vert.vx;
          vert.y += vert.vy;
          
          // remove energy form the system
          vert.x += (vert.ox - vert.x) / 80;
          vert.y += (vert.oy - vert.y) / 80;
        }
        vert.fx = 0;
        vert.fy = 0;
      }
    }
  }
  
  
  function render() {
    var tri;

    // Clear and Reset
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Triangle Debug
    ctx.fillStyle = "none";
    ctx.lineWidth = 1;
    for(var t = 0; t < triangles.length; t ++) {
      tri = triangles[t]
      ctx.fillStyle = tri.color;
      ctx.strokeStyle = tri.color;
      ctx.beginPath();
      ctx.moveTo(tri.a.x, tri.a.y);
      ctx.lineTo(tri.b.x, tri.b.y);
      ctx.lineTo(tri.c.x, tri.c.y);
      ctx.fill();
      ctx.stroke();
    }
  }
  
  function resetImage() {
    canvas.width = root.innerWidth;
    canvas.height = root.innerHeight;
    imgData = getImageData(img);
    buildMesh(canvas.width, canvas.height, 25, 25);
    buildTriangles(imgData);
    buildSprings();
  }
  
  /** Kick off the experiment */
  var img = new Image();
  img.onload = function(event) {
    resetImage();
    
    (function renderLoop() {
      requestAnimFrame(renderLoop);

      // Input
      for(var m = 0; m < 3; m ++) {
        mouse[m] = mouse[m + 1];
      }

      simulate();
      render();
    })();

    $(window).mousemove(function(event) {
      mouse[3] = {x: event.pageX, y: event.pageY};
    });
    
    $(window).resize(function(event) {
      resetImage();
    });
  }
  img.src = "/static/1/img/box.jpg";
  
 
}).call(this);
