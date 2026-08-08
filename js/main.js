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
    cities: { val: 'kpiCities' },
    orders: { val: 'kpiOrders' },
    rate:   { val: 'kpiRate'   },
    trace:  { val: 'kpiTrace'  },
  };

  function updateKPI(data) {
    Object.keys(kpiIds).forEach(function(key) {
      var ids = kpiIds[key], valEl = document.getElementById(ids.val);
      if (!valEl) return;
      var val = data[key], newText;
      if (key === 'rate' || key === 'trace') { newText = (key==='trace') ? DataStore.fmtPct2(val) : DataStore.fmtPct1(val); }
      else { newText = DataStore.fmtNum(val); }
      valEl.textContent = newText;
    });
  }

  var CAT_COLORS = ['#00d2ff','#00e676','#ff9100','#ff4081','#a78bfa','#ffd740','#448aff','#1de9b6','#ff6e40','#40c4ff','#b2ff59','#ea80fc'];

  /* ================ 溯源检测面板 ================ */
  function renderTraceability() {
    var body = document.getElementById('traceBody'); if (!body) return;
    var d = DataStore.getTraceabilityData();
    var colorMap = { green:'green', cyan:'', purple:'purple', orange:'orange' };
    body.innerHTML = d.items.map(function(it){
      return '<div class="progress-item"><div class="progress-head"><span class="label">'+it.label+'</span><span class="val">'+String(it.val)+'%</span></div><div class="progress-bar"><div class="progress-fill '+(colorMap[it.color]||'')+'" style="width:'+it.val+'%"></div></div></div>';
    }).join('');
  }

  /* ================ 商品细化分类面板（饼图） ================ */
  var productPieChart = null;
  function renderProductDetail() {
    var dom = document.getElementById('chartProductPie');
    if (!dom) return;
    if (productPieChart) productPieChart.dispose();
    productPieChart = Charts.renderPie('chartProductPie', DataStore.getProductPieData());
    if (productPieChart) chartInstances.push(productPieChart);
  }

  /* ================ 供应商信息面板 ================ */
  function renderSupplier() {
    var body = document.getElementById('supplierBody'); if (!body) return;
    var d = DataStore.getSupplierData();
    var html = '<div style="display:flex;gap:5px;margin-bottom:3px;">' +
      '<div class="stat-item" style="flex:1;"><div class="stat-num">'+d.total+'</div><div class="stat-label">供应商总数</div></div>' +
      '<div class="stat-item" style="flex:1;"><div class="stat-num" style="color:#00e676;">'+d.aCount+'</div><div class="stat-label">A级供应商</div></div>' +
    '</div>';
    html += '<div style="font-size:16px;color:#6678a0;margin-bottom:1px;">▎供应商列表</div>';
    html += '<div class="supplier-scroll" style="overflow:hidden;flex:1;position:relative;">';
    html += '<div class="supplier-scroll-inner" style="animation:scrollUp 35s linear infinite;">';
    // 打乱顺序
    var list = d.suppliers.slice().sort(function(){return Math.random()-0.5});
    var items = '';
    list.forEach(function(s, i){
      var rColor = s.rating==='A'?'#00e676':'#ffd740';
      items += '<div style="display:flex;align-items:center;gap:6px;padding:3px 0;border-bottom:1px solid rgba(255,255,255,0.03);font-size:13px;">' +
        '<span style="width:5px;height:5px;border-radius:50%;background:'+rColor+';flex-shrink:0;"></span>' +
        '<span style="color:#fff;flex:1;">'+s.name+'</span>' +
        '<span style="color:'+rColor+';font-weight:600;">'+s.rating+'</span>' +
      '</div>';
    });
    html += items + items + '</div></div>';
    body.innerHTML = html;
  }

  /* ================ 服务人次面板 ================ */
  function renderService() {
    var body = document.getElementById('serviceBody'); if (!body) return;
    var d = DataStore.getServiceData();
    body.innerHTML =
      '<div class="stat-hero"><div class="hero-num">'+DataStore.fmtNum(DataStore.getKPI().service)+'</div><div class="hero-label">累计服务人次</div></div>' +
      '<div class="stat-row"><div class="stat-item"><div class="stat-num">'+DataStore.fmtNum(d.todayNew)+'</div><div class="stat-label">今日新增</div></div><div class="stat-item"><div class="stat-num">'+DataStore.fmtNum(d.monthNew)+'</div><div class="stat-label">本月新增</div></div></div>' +
      '<div style="margin-top:2px;font-size:16px;color:#6678a0;text-align:center;">近7天服务人次趋势</div>' +
      '<div class="service-bars">'+d.barDays.map(function(day){var h=Math.round((day.value/d.maxVal)*100);return '<div class="service-bar '+(h>80?'high':'')+'" style="height:'+h+'%" title="'+day.label+': '+DataStore.fmtNum(day.value)+'"></div>';}).join('')+'</div>';
  }

  /* ================ 车辆轨迹信息面板 ================ */
  function renderVehicle() {
    var body = document.getElementById('vehicleBody'); if (!body) return;
    var d = DataStore.getVehicleData();
    var html = '<div style="display:flex;gap:5px;margin-bottom:3px;">' +
      '<div class="stat-item" style="flex:1;"><div class="stat-num">190</div><div class="stat-label">运输车辆</div></div>' +
      '<div class="stat-item" style="flex:1;"><div class="stat-num" style="color:#00e676;">95</div><div class="stat-label">在途车辆</div></div>' +
    '</div>';
    html += '<div style="font-size:16px;color:#6678a0;margin-bottom:1px;">▎实时轨迹</div>';
    html += '<div class="vehicle-scroll" style="overflow:hidden;flex:1;position:relative;">';
    html += '<div class="vehicle-scroll-inner" style="animation:scrollUp 20s linear infinite;">';
    // 复制两份实现无缝滚动
    var items = '';
    d.vehicles.forEach(function(v){
      var sColor = v.status==='在途'?'#00d2ff':'#ffd740';
      items += '<div style="display:flex;align-items:center;gap:4px;padding:3px 0;border-bottom:1px solid rgba(255,255,255,0.03);font-size:16px;">' +
        '<span style="color:#fff;font-family:Consolas,monospace;width:72px;">'+v.plate+'</span>' +
        '<span style="color:#8899cc;">'+v.from+'→'+v.to+'</span>' +
        '<span style="color:'+sColor+';margin-left:auto;font-weight:600;">'+v.status+'</span>' +
        '<span style="color:#6678a0;">'+v.eta+'</span>' +
      '</div>';
    });
    html += items + items + '</div></div>';
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
    chartInstances.push(Charts.renderBar('chartTrend', DataStore.getMonthlySalesData()));
    chartInstances.push(Charts.renderPie('chartPie', DataStore.getChannelData()));
  }

  function initMap() {
    var mapDom = document.getElementById('chartMap'); if (!mapDom) return;
    if (typeof WUHAN_GEOJSON === 'undefined') {
      mapDom.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#ff4081;font-size:13px;">地图数据缺失</div>';
      return;
    }
    mapDom.innerHTML = '';
    var vehData = DataStore.getVehicleData();
    var vehRoutes = vehData.vehicles.map(function(v, i) {
      var hubs = DataStore.logisticsHubs();
      var fromHub = hubs.find(function(h){return h.name === v.from;}) || {lng:114.3,lat:30.6};
      return { from: {name:v.from,lng:fromHub.lng,lat:fromHub.lat}, to: {name:v.plate,lng:v.lng,lat:v.lat}, value:100 };
    });
    var mapChart = Charts.renderMap('chartMap', WUHAN_GEOJSON, DataStore.logisticsHubs(), vehRoutes, vehData.vehicles);
    if(mapChart) chartInstances.push(mapChart);
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

    // 全部静态不刷新

    var resizeTimer;
    window.addEventListener('resize', function(){ clearTimeout(resizeTimer); resizeTimer = setTimeout(onResize, 200); });
    var refreshBtn = document.getElementById('refreshBtn');
    if(refreshBtn) refreshBtn.addEventListener('click', manualRefresh);
    window.addEventListener('keydown', function(e){ if(e.key==='F5'||(e.ctrlKey&&e.key==='r')){ e.preventDefault(); manualRefresh(); } });
  }

  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
