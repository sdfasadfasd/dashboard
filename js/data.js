/* ============================================================
   data.js - 好来客食品集团湖北总部（全板块后台可配置+动态增删）
   ============================================================ */

const DataStore = (() => {

  function loadCfg() { try { return JSON.parse(localStorage.getItem('dashboard_config')) || {}; } catch(e) { return {}; } }
  function cfg(key, fallback) { var c = loadCfg(); var v = c[key]; return (v !== undefined && v !== null) ? v : fallback; }
  function cfgArr(key, fallback) {
    var c = loadCfg();
    if (c[key] && Array.isArray(c[key]) && c[key].length > 0) return c[key];
    return fallback;
  }

  /* ================ KPI ================ */
  function initKPI() {
    return {
      cities:  cfg('kpi_cities', 17),
      orders:  cfg('kpi_orders', 12580),
      rate:    cfg('kpi_rate', 97.5),
      trace:   cfg('kpi_trace', 99.80),
    };
  }
  var kpi = initKPI();
  var kpiTrends = { cities:{dir:'up',val:5.9}, orders:{dir:'up',val:4.2}, rate:{dir:'up',val:0.4}, trace:{dir:'up',val:0.2} };

  /* ================ 物流节点 ================ */
  var HUB_LNGLAT = [ [114.3054,30.5931],[114.3090,30.6001],[114.3162,30.5435],[114.3438,30.5050],[114.1370,30.6200],[114.2180,30.5475],[114.3210,30.3510],[114.3750,30.8810],[114.0290,30.5820],[114.3940,30.6300],[114.8010,30.8500],[114.2650,30.5750],[114.4500,30.5000],[114.1800,30.4800] ];
  var DEFAULT_HUBS = [
    {name:'总部',type:'hq'},{name:'江岸仓',type:'center'},{name:'武昌仓',type:'center'},{name:'洪山仓',type:'center'},
    {name:'东西湖仓',type:'warehouse'},{name:'汉阳仓',type:'warehouse'},{name:'江夏仓',type:'warehouse'},{name:'黄陂仓',type:'warehouse'},
    {name:'蔡甸仓',type:'warehouse'},{name:'青山仓',type:'warehouse'},{name:'新洲仓',type:'warehouse'},{name:'硚口仓',type:'warehouse'},
    {name:'东湖高新仓',type:'warehouse'},{name:'经开仓',type:'warehouse'}
  ];

  function getLogisticsHubs() {
    var arr = cfgArr('hubs', DEFAULT_HUBS);
    return arr.map(function(h, i) {
      var coord = HUB_LNGLAT[i] || HUB_LNGLAT[HUB_LNGLAT.length-1];
      return { name: h.name, lng: coord[0], lat: coord[1], type: h.type || 'warehouse' };
    });
  }
  function getLogisticsRoutes() {
    var hubs = getLogisticsHubs(); var hq = hubs[0];
    return hubs.slice(1).map(function(h) { return { from:{name:hq.name,lng:hq.lng,lat:hq.lat}, to:{name:h.name,lng:h.lng,lat:h.lat}, value:Math.round(50+Math.random()*200) }; });
  }

  /* ================ 溯源检测 ================ */
  var DEFAULT_TRACE = [
    {label:'检测合格率',val:99.7,color:'green'},{label:'冷链达标率',val:98.8,color:'cyan'},
    {label:'农残检测通过率',val:99.9,color:'green'},{label:'批次追溯覆盖率',val:99.4,color:'purple'},
    {label:'供应商审核通过',val:98.2,color:'orange'}
  ];
  function getTraceabilityData() {
    var items = cfgArr('trace_items', DEFAULT_TRACE);
    var base = cfg('tr_tests', 85);
    return {
      items: items.map(function(it) { return { label:it.label, val:it.val+Math.random()*0.6, color:it.color||'cyan' }; }),
      latestBatch: cfg('tr_prefix','WH') + new Date().toISOString().slice(0,10).replace(/-/g,'') + '001',
      batchStatus: '已通过',
      todayTests: Math.round(base + Math.random()*30),
      abnormalCount: Math.floor(Math.random()*2),
    };
  }

  /* ================ 供应商 ================ */
  var DEFAULT_SUPPLIERS = [
    {name:'武汉中粮肉食',cat:'肉禽蛋品',rating:'A'},{name:'襄阳正大食品',cat:'肉禽蛋品',rating:'A'},
    {name:'洪湖水产养殖',cat:'冷冻水产',rating:'B'},{name:'荆门粮油集团',cat:'粮油调味',rating:'A'},
    {name:'恩施高山蔬菜',cat:'生鲜果蔬',rating:'B'},{name:'宜昌柑橘合作社',cat:'生鲜果蔬',rating:'A'},
    {name:'武汉光明乳业',cat:'乳制品',rating:'A'},{name:'黄石调味品厂',cat:'粮油调味',rating:'B'},
    {name:'孝感米酒食品',cat:'粮油调味',rating:'A'},{name:'咸宁烘焙原料',cat:'烘焙原料',rating:'B'}
  ];
  function getSupplierData() {
    var arr = cfgArr('suppliers', DEFAULT_SUPPLIERS);
    var aCount = arr.filter(function(s){return s.rating==='A';}).length;
    return { suppliers: arr.map(function(s){return{name:s.name,cat:s.cat||'',rating:s.rating||'B',status:'正常'};}), total:arr.length, active:arr.length, aCount:aCount };
  }

  /* ================ 商品细化 ================ */
  var DEFAULT_PRODUCTS = [
    {name:'冷冻禽肉',cat:'冷冻食品',val:85000},{name:'冷冻水产',cat:'冷冻食品',val:72000},{name:'速冻面点',cat:'冷冻食品',val:58000},
    {name:'大米杂粮',cat:'粮油调味',val:110000},{name:'食用油',cat:'粮油调味',val:95000},{name:'调味酱料',cat:'粮油调味',val:52000},
    {name:'膨化零食',cat:'休闲零食',val:45000},{name:'坚果炒货',cat:'休闲零食',val:38000},
    {name:'液态奶',cat:'乳制品',val:82000},{name:'酸奶',cat:'乳制品',val:62000},
    {name:'叶菜类',cat:'生鲜果蔬',val:68000},{name:'水果',cat:'生鲜果蔬',val:55000}
  ];
  function getProductDetailData() {
    var items = cfgArr('products', DEFAULT_PRODUCTS).map(function(it) {
      return { name:it.name, cat:it.cat||'', val:Math.round((it.val||10000)+(Math.random()-0.5)*(it.val||10000)*0.08) };
    });
    var total = items.reduce(function(s,it){return s+it.val;},0);
    items.forEach(function(it){ it.pct = ((it.val/total)*100).toFixed(1); });
    var maxVal = Math.max.apply(null, items.map(function(it){return it.val;}));
    return { items:items, maxVal:maxVal };
  }

  /* ================ 服务人次 ================ */
  function getServiceData() {
    var todayNew = cfg('svc_today',4580) + Math.round(Math.random()*1000-500);
    var monthNew = cfg('svc_month',98600) + Math.round(Math.random()*8000-4000);
    var barDays = []; for(var i=6;i>=0;i--) barDays.push({label:'D-'+i,value:Math.round(3500+Math.random()*2500)});
    var maxVal = Math.max.apply(null, barDays.map(function(d){return d.value;}));
    return { todayNew:todayNew, monthNew:monthNew, barDays:barDays, maxVal:maxVal };
  }

  /* ================ 车辆轨迹 ================ */
  var DEFAULT_VEHICLES = [
    {plate:'鄂A·LK8821',driver:'张建国',from:'江汉区',to:'洪山区'},{plate:'鄂A·LK6625',driver:'李卫东',from:'武昌区',to:'东西湖区'},
    {plate:'鄂A·LK5318',driver:'王志强',from:'江岸区',to:'江夏区'},{plate:'鄂A·LK3902',driver:'赵明辉',from:'汉阳区',to:'江汉区'},
    {plate:'鄂A·LK2076',driver:'陈永发',from:'硚口区',to:'黄陂区'},{plate:'鄂A·LK1533',driver:'刘大伟',from:'青山区',to:'蔡甸区'},
    {plate:'鄂A·LK0891',driver:'周华军',from:'洪山区',to:'新洲区'},{plate:'鄂A·LK9720',driver:'孙志刚',from:'江夏区',to:'武昌区'}
  ];
  var VEH_COORDS = [[114.32,30.55],[114.25,30.58],[114.33,30.45],[114.26,30.57],[114.33,30.72],[114.18,30.58],[114.55,30.68],[114.33,30.42]];
  function getVehicleData() {
    var vehicles = cfgArr('vehicles', DEFAULT_VEHICLES).map(function(v, i) {
      var coord = VEH_COORDS[i] || [114.3+Math.random()*0.5, 30.5+Math.random()*0.3];
      var status = (i===3||i===7) ? '返程' : '在途';
      return { plate:v.plate, driver:v.driver||'', from:v.from||'', to:v.to||'', status:status, speed:40+Math.floor(Math.random()*20), eta:(15+Math.floor(Math.random()*40))+'min', lng:coord[0], lat:coord[1] };
    });
    var active = vehicles.filter(function(v){return v.status==='在途';}).length;
    return { vehicles:vehicles, total:vehicles.length, active:active };
  }

  /* ================ 供应链 ================ */
  function getSupplyChainData() {
    return {
      totalSuppliers: cfg('sp_total',156), activeSuppliers: Math.round(cfg('sp_active',142)+(Math.random()-0.5)*8),
      inventoryTurnover: (cfg('sp_turn',5.8)+(Math.random()-0.5)*1.2).toFixed(1),
      procurementRate: (cfg('sp_proc',95.2)+(Math.random()-0.5)*3).toFixed(1),
      totalVehicles: cfg('sp_veh',186), todayShipments: Math.round(cfg('sp_ship',480)+(Math.random()-0.5)*80),
      warehouseUsage: (cfg('sp_wh',76.5)+(Math.random()-0.5)*8).toFixed(1),
      avgDeliveryH: (cfg('sp_del',8.5)+(Math.random()-0.5)*3).toFixed(1),
    };
  }

  /* ================ 趋势/饼图 ================ */
  var DEFAULT_CATS = ['冷冻食品','粮油调味','休闲零食','乳制品','生鲜果蔬','烘焙原料','肉禽蛋品','酒水饮料'];
  var DEFAULT_CHNS = ['商超卖场','餐饮渠道','电商平台','便利店','团购渠道','经销商'];
  function getCategoryData() {
    var cats = cfgArr('chart_cats', DEFAULT_CATS);
    return { categories:cats, values:cats.map(function(){return Math.round(40000+Math.random()*180000);}) };
  }
  function getChannelData() {
    var chns = cfgArr('chart_chns', DEFAULT_CHNS);
    var raw = chns.map(function(n){return{name:n,value:Math.round(30+Math.random()*300)};});
    var total = raw.reduce(function(s,it){return s+it.value;},0);
    return raw.map(function(it){return{name:it.name,value:it.value,percent:((it.value/total)*100).toFixed(1)};});
  }

  /* ================ 工具 ================ */
  function fluctuate(base, percent) { return Math.round(base*(1+(Math.random()-0.5)*2*(percent/100))); }
  function fmtNum(n) { return n.toLocaleString('zh-CN'); }
  function fmtPct1(n) { return n.toFixed(1)+'%'; }
  function fmtPct2(n) { return n.toFixed(2)+'%'; }

  /* ================ 公开接口 ================ */
  function getKPI() { return {cities:kpi.cities,orders:kpi.orders,rate:kpi.rate,trace:kpi.trace,trends:{...kpiTrends}}; }
  function refreshKPI() {
    kpi = initKPI();
    kpi.cities += (Math.random()>0.85?1:0); kpi.orders = fluctuate(kpi.orders,1.2);
    kpi.rate = Math.min(99.9,Math.max(95,Math.round((kpi.rate+(Math.random()-0.4)*0.3)*10)/10));
    kpi.trace = Math.min(100,Math.max(98,Math.round((kpi.trace+(Math.random()-0.4)*0.15)*100)/100));
    ['cities','orders','rate','trace'].forEach(function(k){kpiTrends[k].val=Math.round((kpiTrends[k].val+(Math.random()-0.5)*0.4)*10)/10;});
    return getKPI();
  }
  function getTrendData() {
    var dates=[],sales=[],orders=[],now=new Date(),s=40000,o=380;
    for(var i=29;i>=0;i--){var d=new Date(now);d.setDate(d.getDate()-i);dates.push((d.getMonth()+1)+'/'+d.getDate());s+=Math.round((Math.random()-0.35)*2500);o+=Math.round((Math.random()-0.3)*15);sales.push(s);orders.push(o);}
    return {dates:dates,salesSeries:sales,ordersSeries:orders};
  }

  return {
    getKPI, refreshKPI, getTrendData, getCategoryData, getChannelData,
    logisticsHubs: getLogisticsHubs, getLogisticsRoutes,
    getTraceabilityData, getSupplierData, getServiceData, getVehicleData, getSupplyChainData, getProductDetailData,
    fmtNum, fmtPct1, fmtPct2,
  };
})();
