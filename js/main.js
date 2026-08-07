/* ============================================================
   main.js - 好来客食品集团湖北总部
   ============================================================ */

(function () {
  'use strict';

  var chartInstances = [];

  /* ================ 背景粒子 ================ */
  function initBackground() {
    var canvas = document.getElementById('bgCanvas');
    var ctx = canvas.getContext('2d');
    var W, H;
    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resize(); window.addEventListener('resize', resize);
    var N = 80, dots = [];
    for (var i = 0; i < N; i++) {
      dots.push({ x: Math.random()*W, y: Math.random()*H, r: Math.random()*1.6+0.4, vx: (Math.random()-0.5)*0.35, vy: (Math.random()-0.5)*0.35, alpha: Math.random()*0.5+0.15 });
    }
    function draw() {
      ctx.clearRect(0,0,W,H);
      for (var i=0;i<dots.length;i++) {
        var d = dots[i]; d.x+=d.vx; d.y+=d.vy;
        if(d.x<0||d.x>W)d.vx*=-1; if(d.y<0||d.y>H)d.vy*=-1;
        ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,Math.PI*2);
        ctx.fillStyle='rgba(0,210,255,'+d.alpha+')'; ctx.fill();
      }
      for (var i=0;i<dots.length;i++) {
        for (var j=i+1;j<dots.length;j++) {
          var dx=dots[i].x-dots[j].x, dy=dots[i].y-dots[j].y, dist=Math.sqrt(dx*dx+dy*dy);
          if(dist<120){ ctx.beginPath(); ctx.moveTo(dots[i].x,dots[i].y); ctx.lineTo(dots[j].x,dots[j].y); ctx.strokeStyle='rgba(0,180,255,'+(0.08*(1-dist/120))+')'; ctx.lineWidth=0.5; ctx.stroke(); }
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ================ 时钟 ================ */
  function updateClock() {
    var el = document.getElementById('datetime'); if(!el)return;
    var now = new Date(), pad = function(n){return String(n).padStart(2,'0');};
    el.textContent = now.getFullYear()+'-'+pad(now.getMonth()+1)+'-'+pad(now.getDate())+'  '+pad(now.getHours())+':'+pad(now.getMinutes())+':'+pad(now.getSeconds());
  }

  /* ================ KPI ================ */
  var kpiIds = {
    cities: { val: 'kpiCities', trend: 'kpiCitiesTrend' },
    orders: { val: 'kpiOrders', trend: 'kpiOrdersTrend' },
    service:{ val: 'kpiService',trend: 'kpiServiceTrend'},
    rate:   { val: 'kpiRate',   trend: 'kpiRateTrend'   },
    trace:  { val: 'kpiTrace',  trend: 'kpiTraceTrend'  },
  };

  function updateKPI(data) {
    Object.keys(kpiIds).forEach(function(key) {
      var ids = kpiIds[key], valEl = document.getElementById(ids.val), trendEl = document.getElementById(ids.trend);
      if (!valEl) return;
      var val = data[key], newText;
      if (key === 'rate' || key === 'trace') { newText = (key==='trace') ? DataStore.fmtPct2(val) : DataStore.fmtPct1(val); }
      else { newText = DataStore.fmtNum(val); }
      valEl.textContent = newText;
      if (trendEl && data.trends[key]) { var t = data.trends[key]; trendEl.textContent = (t.dir==='up'?'↑ ':'↓ ') + t.val + '%'; trendEl.className = 'kpi-trend ' + t.dir; }
    });
  }

  var CAT_COLORS = ['#00d2ff','#00e676','#ff9100','#ff4081','#a78bfa','#ffd740','#448aff','#1de9b6','#ff6e40','#40c4ff','#b2ff59','#ea80fc'];

  /* ================ 溯源检测面板 ================ */
  function renderTraceability() {
    var body = document.getElementById('traceBody'); if (!body) return;
    var d = DataStore.getTraceabilityData();
    var colorMap = { green:'green', cyan:'', purple:'purple', orange:'orange' };
    body.innerHTML = d.items.map(function(it){
      return '<div class="progress-item"><div class="progress-head"><span class="label">'+it.label+'</span><span class="val">'+it.val.toFixed(2)+'%</span></div><div class="progress-bar"><div class="progress-fill '+(colorMap[it.color]||'')+'" style="width:'+it.val+'%"></div></div></div>';
    }).join('');
  }

  /* ================ 商品细化分类面板 ================ */
  function renderProductDetail() {
    var body = document.getElementById('productBody'); if (!body) return;
    var d = DataStore.getProductDetailData();
    var groups = {};
    d.items.forEach(function(it) {
      if (!groups[it.cat]) groups[it.cat] = [];
      groups[it.cat].push(it);
    });
    var html = '';
    var gi = 0;
    Object.keys(groups).forEach(function(cat) {
      var color = CAT_COLORS[gi % CAT_COLORS.length];
      html += '<div style="font-size:9px;color:'+color+';margin:1px 0 0;letter-spacing:1px;">▎'+cat+'</div>';
      groups[cat].forEach(function(it) {
        var w = Math.round((it.val / d.maxVal) * 100);
        html += '<div class="cat-row"><span class="cat-name">'+it.name+'</span><span class="cat-bar-wrap"><span class="cat-bar-fill" style="width:'+w+'%;background:'+color+';"></span></span><span class="cat-val">'+DataStore.fmtNum(it.val)+'</span></div>';
      });
      gi++;
    });
    body.innerHTML = '<div class="cat-list">'+html+'</div>';
  }

  /* ================ 供应商信息面板 ================ */
  function renderSupplier() {
    var body = document.getElementById('supplierBody'); if (!body) return;
    var d = DataStore.getSupplierData();
    var html = '<div style="display:flex;gap:5px;margin-bottom:3px;">' +
      '<div class="stat-item" style="flex:1;"><div class="stat-num">'+d.total+'</div><div class="stat-label">供应商总数</div></div>' +
      '<div class="stat-item" style="flex:1;"><div class="stat-num" style="color:#00e676;">'+d.aCount+'</div><div class="stat-label">A级供应商</div></div>' +
    '</div>';
    html += '<div style="font-size:9px;color:#6678a0;margin-bottom:1px;">▎供应商列表</div>';
    html += '<div style="display:flex;flex-direction:column;gap:0;overflow-y:auto;flex:1;">';
    d.suppliers.forEach(function(s, i){
      var rColor = s.rating==='A'?'#00e676':'#ffd740';
      html += '<div style="display:flex;align-items:center;gap:6px;padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.03);font-size:9px;">' +
        '<span style="width:6px;height:6px;border-radius:50%;background:'+rColor+';flex-shrink:0;"></span>' +
        '<span style="color:#fff;flex:1;">'+s.name+'</span>' +
        '<span style="color:#8899cc;">'+s.cat+'</span>' +
        '<span style="color:'+rColor+';font-weight:600;">'+s.rating+'</span>' +
      '</div>';
    });
    html += '</div>';
    body.innerHTML = html;
  }

  /* ================ 服务人次面板 ================ */
  function renderService() {
    var body = document.getElementById('serviceBody'); if (!body) return;
    var d = DataStore.getServiceData();
    body.innerHTML =
      '<div class="stat-hero"><div class="hero-num">'+DataStore.fmtNum(DataStore.getKPI().service)+'</div><div class="hero-label">累计服务人次</div></div>' +
      '<div class="stat-row"><div class="stat-item"><div class="stat-num">'+DataStore.fmtNum(d.todayNew)+'</div><div class="stat-label">今日新增</div></div><div class="stat-item"><div class="stat-num">'+DataStore.fmtNum(d.monthNew)+'</div><div class="stat-label">本月新增</div></div></div>' +
      '<div style="margin-top:2px;font-size:9px;color:#6678a0;text-align:center;">近7天服务人次趋势</div>' +
      '<div class="service-bars">'+d.barDays.map(function(day){var h=Math.round((day.value/d.maxVal)*100);return '<div class="service-bar '+(h>80?'high':'')+'" style="height:'+h+'%" title="'+day.label+': '+DataStore.fmtNum(day.value)+'"></div>';}).join('')+'</div>';
  }

  /* ================ 车辆轨迹信息面板 ================ */
  function renderVehicle() {
    var body = document.getElementById('vehicleBody'); if (!body) return;
    var d = DataStore.getVehicleData();
    var html = '<div style="display:flex;gap:5px;margin-bottom:3px;">' +
      '<div class="stat-item" style="flex:1;"><div class="stat-num">'+d.total+'</div><div class="stat-label">运输车辆</div></div>' +
      '<div class="stat-item" style="flex:1;"><div class="stat-num" style="color:#00e676;">'+d.active+'</div><div class="stat-label">在途车辆</div></div>' +
    '</div>';
    html += '<div style="font-size:9px;color:#6678a0;margin-bottom:1px;">▎实时轨迹</div>';
    html += '<div style="display:flex;flex-direction:column;gap:0;overflow-y:auto;flex:1;">';
    d.vehicles.forEach(function(v){
      var sColor = v.status==='在途'?'#00d2ff':'#ffd740';
      html += '<div style="display:flex;align-items:center;gap:4px;padding:3px 0;border-bottom:1px solid rgba(255,255,255,0.03);font-size:9px;">' +
        '<span style="color:#fff;font-family:Consolas,monospace;width:72px;">'+v.plate+'</span>' +
        '<span style="color:#8899cc;">'+v.from+'→'+v.to+'</span>' +
        '<span style="color:'+sColor+';margin-left:auto;font-weight:600;">'+v.status+'</span>' +
        '<span style="color:#6678a0;">'+v.eta+'</span>' +
      '</div>';
    });
    html += '</div>';
    body.innerHTML = html;
  }

  /* ================ 供应链面板 ================ */
  function renderSupplyChain() {
    var body = document.getElementById('supplyBody'); if (!body) return;
    var d = DataStore.getSupplyChainData();
    body.innerHTML =
      '<div class="stat-row"><div class="stat-item"><div class="stat-num">'+d.totalSuppliers+'</div><div class="stat-label">供应商总数</div></div><div class="stat-item"><div class="stat-num" style="color:#00e676;">'+d.activeSuppliers+'</div><div class="stat-label">活跃供应商</div></div></div>' +
      '<div class="supply-list">' +
        '<div class="supply-row"><span class="s-label">库存周转天数</span><span class="s-val">'+d.inventoryTurnover+' 天</span></div>' +
        '<div class="supply-row"><span class="s-label">采购完成率</span><span class="s-val" style="color:#00e676;">'+d.procurementRate+'%</span></div>' +
        '<div class="supply-row"><span class="s-label">仓库使用率</span><span class="s-val" style="color:#ff9100;">'+d.warehouseUsage+'%</span></div>' +
        '<div class="supply-row"><span class="s-label">在途车辆</span><span class="s-val">'+d.totalVehicles+' 辆</span></div>' +
        '<div class="supply-row"><span class="s-label">今日发货量</span><span class="s-val">'+DataStore.fmtNum(d.todayShipments)+' 单</span></div>' +
        '<div class="supply-row"><span class="s-label">平均配送时效</span><span class="s-val">'+d.avgDeliveryH+' 小时</span></div>' +
      '</div>';
  }

  /* ================ 刷新所有面板 ================ */
  function refreshInfoPanels() {
    renderTraceability();
    renderVehicle();
    renderSupplier();
    renderProductDetail();
    renderSupplyChain();
  }

  /* ================ 图表 ================ */
  function initCharts() {
    chartInstances.push(Charts.renderTrend('chartTrend', DataStore.getTrendData()));
    chartInstances.push(Charts.renderPie('chartPie', DataStore.getChannelData()));
  }

  function initMap() {
    var mapDom = document.getElementById('chartMap'); if (!mapDom) return;
    mapDom.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#8899cc;font-size:12px;">武汉市地图加载中...</div>';
    // 武汉市 GeoJSON（本地文件）
    fetch('js/wuhan.json')
      .then(function(res){return res.json();})
      .then(function(geoJSON){
        mapDom.innerHTML = '';
        var vehData = DataStore.getVehicleData();
        // 飞线终点 = 车辆当前位置
        var vehRoutes = vehData.vehicles.map(function(v) {
          return {
            from: { name: '总部', lng: 114.3054, lat: 30.5931 },
            to:   { name: v.plate, lng: v.lng, lat: v.lat },
            value: 100,
          };
        });
        var mapChart = Charts.renderMap('chartMap', geoJSON, DataStore.logisticsHubs(), vehRoutes, vehData.vehicles);
        if(mapChart) chartInstances.push(mapChart);
      })
      .catch(function(){
        mapDom.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#8899cc;gap:6px;"><span style="font-size:24px;">🗺</span><span style="font-size:11px;">地图加载失败</span><span style="font-size:10px;color:#556688;">请检查网络后刷新</span></div>';
      });
  }

  function onResize() { Charts.resizeAll(chartInstances); }

  function manualRefresh() {
    updateKPI(DataStore.refreshKPI());
    refreshInfoPanels();
    chartInstances.forEach(function(c){c&&c.dispose&&c.dispose();});
    chartInstances.length = 0;
    initCharts(); initMap();
  }

  /* ================ 入口 ================ */
  function init() {
    initBackground();
    updateKPI(DataStore.getKPI());
    refreshInfoPanels();
    initCharts(); initMap();
    updateClock(); setInterval(updateClock, 1000);

    function scheduleRefresh() {
      setTimeout(function(){ updateKPI(DataStore.refreshKPI()); refreshInfoPanels(); scheduleRefresh(); }, 3000 + Math.random()*2000);
    }
    scheduleRefresh();

    var resizeTimer;
    window.addEventListener('resize', function(){ clearTimeout(resizeTimer); resizeTimer = setTimeout(onResize, 200); });
    var refreshBtn = document.getElementById('refreshBtn');
    if(refreshBtn) refreshBtn.addEventListener('click', manualRefresh);
    window.addEventListener('keydown', function(e){ if(e.key==='F5'||(e.ctrlKey&&e.key==='r')){ e.preventDefault(); manualRefresh(); } });
  }

  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
