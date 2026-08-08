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
    return {
      items: [
        { label:'检测合格率', val:99.3, color:'green' },
        { label:'冷链达标率', val:97.2, color:'cyan' },
        { label:'农残检测通过率', val:98.5, color:'green' },
        { label:'批次追溯覆盖率', val:100, color:'purple' },
        { label:'供应商审核通过', val:98.2, color:'orange' },
      ],
      latestBatch: cfg('tr_prefix','WH') + new Date().toISOString().slice(0,10).replace(/-/g,'') + '001',
      batchStatus: '已通过',
      todayTests: 85,
      abnormalCount: 0,
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
    return {
      suppliers: [
        {name:'中粮集团有限公司',rating:'A'},{name:'益海嘉里金龙鱼食品集团股份有限公司',rating:'A'},
        {name:'正大集团',rating:'A'},{name:'重庆恒都农业集团有限公司',rating:'A'},
        {name:'佛山市海天调味食品股份有限公司',rating:'A'},{name:'李锦记集团有限公司',rating:'A'},
        {name:'上海太太乐食品有限公司',rating:'A'},{name:'祖名豆制品集团股份有限公司',rating:'A'},
        {name:'温氏食品集团股份有限公司',rating:'A'},{name:'厦门绿帝生态股份有限公司',rating:'A'},
        {name:'三全食品股份有限公司',rating:'A'},{name:'上海味好美食品有限公司',rating:'A'},
        {name:'五常市乔府大院农业股份有限公司',rating:'A'},{name:'安井食品集团股份有限公司',rating:'A'},
        {name:'五得利面粉集团有限公司',rating:'A'},{name:'中粮福临门食品营销有限公司',rating:'A'},
        {name:'河南华英农业发展股份有限公司',rating:'A'},{name:'山东鲁花集团股份有限公司',rating:'A'},
        {name:'郑州千味央厨食品股份有限公司',rating:'A'},{name:'北京二商王致和食品有限公司',rating:'A'},
        {name:'郑州思念食品有限公司',rating:'A'},{name:'江苏恒顺醋业股份有限公司',rating:'A'},
        {name:'湖北盐业集团有限公司武汉分公司',rating:'A'},{name:'武汉市大佳食品有限公司',rating:'B'},
        {name:'湖北豆麦鲜食品有限公司',rating:'B'},{name:'武汉米澜仓生鲜配送有限公司',rating:'B'},
        {name:'武汉柚禾供应链有限公司',rating:'B'},{name:'武汉隆友食品有限公司',rating:'B'},
        {name:'武汉伯贤达仕科技有限公司',rating:'B'},{name:'湖北顶膳食品有限公司',rating:'B'},
        {name:'武汉昱鑫伟业商贸有限公司',rating:'B'},{name:'湖北省卤小仙食品有限公司',rating:'B'},
        {name:'湖北兴霖食品有限公司',rating:'B'},{name:'武汉玖意食品有限公司',rating:'B'},
        {name:'武汉好食惠食品有限公司',rating:'B'},
      ],
      total: 675, active: 675, aCount: 68,
    };
  }

  /* ================ 商品细化饼图（静态） ================ */
  function getProductPieData() {
    return [
      {name:'蔬果类',value:20.01},{name:'畜类',value:27.62},{name:'冻品类',value:16.07},
      {name:'粮油类',value:6.81},{name:'水产类',value:4.24},{name:'干货类',value:4.17},
      {name:'熟食品',value:3.39},{name:'蛋类',value:2.68},{name:'早点类',value:2.29},{name:'其他类',value:12.72},
    ];
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
    {plate:'鄂AD51969',driver:'张建国',from:'江汉区',to:'洪山区'},{plate:'鄂AAK1897',driver:'李卫东',from:'武昌区',to:'东西湖区'},
    {plate:'鄂WMF000',driver:'王志强',from:'江岸区',to:'江夏区'},{plate:'鄂WKY289',driver:'赵明辉',from:'汉阳区',to:'黄陂区'},
    {plate:'鄂WLG636',driver:'陈永发',from:'硚口区',to:'蔡甸区'},{plate:'鄂AAS9692',driver:'刘大伟',from:'青山区',to:'新洲区'},
    {plate:'鄂AAJ5773',driver:'周华军',from:'洪山区',to:'汉南区'},{plate:'鄂ABE5089',driver:'孙志刚',from:'江夏区',to:'江岸区'},
    {plate:'鄂ABA3910',driver:'吴永强',from:'东湖高新',to:'江汉区'},{plate:'鄂AA73510',driver:'郑光明',from:'武汉经开',to:'东西湖区'},
    {plate:'鄂W37861',driver:'黄文斌',from:'汉南区',to:'硚口区'},{plate:'鄂A2V760',driver:'杨海峰',from:'黄陂区',to:'青山区'},
    {plate:'鄂WXC234',driver:'马国良',from:'蔡甸区',to:'武昌区'},{plate:'鲁DF378E',driver:'朱志远',from:'新洲区',to:'汉阳区'},
    {plate:'鄂AB22219',driver:'林海生',from:'东西湖区',to:'东湖高新'},{plate:'鄂A2T67R',driver:'徐国栋',from:'江汉区',to:'武汉经开'},
    {plate:'鄂W909S7',driver:'冯志强',from:'武昌区',to:'东湖高新'},{plate:'鄂AC52786',driver:'何永康',from:'江岸区',to:'汉南区'},
    {plate:'皖HD93495',driver:'丁海龙',from:'硚口区',to:'黄陂区'},{plate:'鄂A62T03',driver:'沈卫国',from:'青山区',to:'蔡甸区'}
  ];
  // 武汉市各区内固定坐标（20个）
  var FIXED_COORDS = [[114.31,30.60],[114.32,30.55],[114.27,30.57],[114.22,30.54],[114.33,30.52],[114.39,30.63],[114.35,30.48],[114.15,30.62],[114.21,30.34],[114.16,30.56],[114.37,30.38],[114.38,30.85],[114.60,30.78],[114.44,30.50],[114.18,30.48],[114.25,30.50],[114.40,30.55],[114.30,30.40],[114.20,30.70],[114.35,30.65]];
  function getVehicleData() {
    var vehicles = cfgArr('vehicles', DEFAULT_VEHICLES).map(function(v, i) {
      var coord = FIXED_COORDS[i] || [114.3, 30.6];
      var status = (i===3||i===7||i===11||i===16||i===18) ? '返程' : '在途';
      return { plate:v.plate, driver:v.driver||'', from:v.from||'', to:v.to||'', status:status, speed:40+Math.floor(Math.random()*20), eta:(15+Math.floor(Math.random()*40))+'min', lng:coord[0], lat:coord[1] };
    });
    var active = vehicles.filter(function(v){return v.status==='在途';}).length;
    return { vehicles:vehicles, total:vehicles.length, active:active };
  }

  /* ================ 供应链 ================ */
  function getSupplyChainData() {
    return {
      totalSuppliers: 675, activeSuppliers: 532,
      inventoryTurnover: 5,
      procurementRate: 99.9,
      totalVehicles: 95, todayShipments: 442,
      warehouseUsage: 75,
      avgDeliveryH: 4.5,
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
    return [
      {name:'学校',value:68,percent:'68%'},
      {name:'央国企',value:15,percent:'15%'},
      {name:'政府机关',value:10,percent:'10%'},
      {name:'其他',value:7,percent:'7%'},
    ];
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
    getTraceabilityData, getSupplierData, getServiceData, getVehicleData, getSupplyChainData, getProductPieData,
    fmtNum, fmtPct1, fmtPct2,
  };
})();
