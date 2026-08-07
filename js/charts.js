/* ============================================================
   charts.js - ECharts 图表配置与渲染
   ============================================================ */

const Charts = (() => {
  /* ---- 暗色主题色盘 ---- */
  const COLORS = {
    cyan:   '#00d2ff',
    green:  '#00e676',
    orange: '#ff9100',
    pink:   '#ff4081',
    purple: '#a78bfa',
    blue:   '#448aff',
    yellow: '#ffd740',
    teal:   '#1de9b6',
  };

  const COLOR_LIST = Object.values(COLORS);

  /* ================ 公共 ECharts 基础配置 ================ */
  function baseOption() {
    return {
      backgroundColor: 'transparent',
      textStyle: {
        color: '#8899cc',
        fontFamily: "'Microsoft YaHei','PingFang SC',sans-serif",
        fontSize: 11,
      },
      grid: {
        top: 20,
        right: 20,
        bottom: 24,
        left: 50,
        containLabel: false,
      },
      tooltip: {
        backgroundColor: 'rgba(10, 18, 50, 0.92)',
        borderColor: 'rgba(0, 210, 255, 0.35)',
        textStyle: { color: '#e0e8ff', fontSize: 12 },
      },
    };
  }

  /* ================ 折线趋势图（销售额百分比） ================ */
  function renderTrend(domId, data) {
    const dom = document.getElementById(domId);
    if (!dom) return null;

    // 销售额转为百分比（以30天内最大值为100%）
    const maxSales = Math.max(...data.salesSeries);
    const salesPct = data.salesSeries.map(v => parseFloat(((v / maxSales) * 100).toFixed(1)));

    const chart = echarts.init(dom);
    const opt = {
      ...baseOption(),
      legend: {
        right: 10,
        top: 2,
        textStyle: { color: '#8899cc', fontSize: 11 },
        itemWidth: 16,
        itemHeight: 8,
      },
      xAxis: {
        type: 'category',
        data: data.dates,
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
        axisTick: { show: false },
        axisLabel: { color: '#6678a0', fontSize: 9, interval: 5 },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        name: '%',
        max: 110,
        nameTextStyle: { color: '#6678a0', fontSize: 10 },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } },
        axisLabel: { color: '#6678a0', fontSize: 9, formatter: '{value}%' },
      },
      series: [
        {
          name: '销售额占比',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 2,
          lineStyle: { color: COLORS.cyan, width: 2 },
          itemStyle: { color: COLORS.cyan },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(0, 210, 255, 0.25)' },
              { offset: 1, color: 'rgba(0, 210, 255, 0.02)' },
            ]),
          },
          data: salesPct,
        },
        {
          name: '订单量',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 2,
          lineStyle: { color: COLORS.orange, width: 2 },
          itemStyle: { color: COLORS.orange },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(255, 145, 0, 0.18)' },
              { offset: 1, color: 'rgba(255, 145, 0, 0.02)' },
            ]),
          },
          data: data.ordersSeries,
        },
      ],
      grid: { top: 28, right: 20, bottom: 18, left: 44 },
    };

    chart.setOption(opt);
    return chart;
  }

  /* ================ 中国地图 + 物流飞线 ================ */
  function renderMap(domId, geoJSON, hubs, routes, vehicles) {
    const dom = document.getElementById(domId);
    if (!dom) return null;

    // 注册地图（兼容全国/省级 GeoJSON）
    echarts.registerMap('hubei', geoJSON);

    const chart = echarts.init(dom);

    // 飞线数据（终点=车辆位置）
    const linesSeries = routes.map(function(r) {
      return {
        name: r.to.name,
        coords: [[r.from.lng, r.from.lat], [r.to.lng, r.to.lat]],
        lineStyle: { color: COLORS.cyan, width: 1, opacity: 0.5, curveness: 0.2 },
      };
    });

    // 小车图标 SVG path
    var carIcon = 'path://M17.5,5.5 L19,8 L19,11.5 L21,11.5 L21,15 L19,15 L19,14 L5,14 L5,15 L3,15 L3,11.5 L5,11.5 L5,8 L6.5,5.5 Z M7,12.5 A1.5,1.5 0 1,0 7,9.5 A1.5,1.5 0 1,0 7,12.5 M17,12.5 A1.5,1.5 0 1,0 17,9.5 A1.5,1.5 0 1,0 17,12.5';

    // 车辆位置标记
    const vehicleScatter = (vehicles || []).map(function(v) {
      var angle = Math.atan2(v.to ? 0.5 : 0, v.from ? 1 : 0) * 180 / Math.PI;
      return {
        name: v.plate + ' ' + v.from + '→' + v.to,
        value: [v.lng, v.lat],
        symbol: carIcon,
        symbolSize: 20,
        symbolRotate: v.status === '返程' ? 180 : 0,
        itemStyle: { color: v.status === '在途' ? '#00d2ff' : '#ffd740' },
        label: {
          show: true,
          formatter: v.plate.replace('鄂A·',''),
          position: 'top',
          color: '#fff',
          fontSize: 7,
          offset: [0, -12],
        },
      };
    });

    const opt = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(10, 18, 50, 0.92)',
        borderColor: 'rgba(0, 210, 255, 0.35)',
        textStyle: { color: '#e0e8ff', fontSize: 12 },
      },
      geo: {
        map: 'hubei',
        roam: true,
        zoom: 3.2,
        center: [114.35, 30.62],
        aspectScale: 0.72,
        itemStyle: {
          areaColor: 'rgba(10, 25, 60, 0.7)',
          borderColor: 'rgba(0, 180, 255, 0.3)',
          borderWidth: 1,
          shadowColor: 'rgba(0, 150, 255, 0.15)',
          shadowBlur: 8,
        },
        emphasis: {
          itemStyle: {
            areaColor: 'rgba(20, 50, 100, 0.85)',
            borderColor: 'rgba(0, 210, 255, 0.7)',
            borderWidth: 2,
          },
        },
        label: { show: true, color: '#8899cc', fontSize: 10 },
      },
      series: [
        // 静态飞线
        {
          type: 'lines',
          coordinateSystem: 'geo',
          polyline: false,
          data: linesSeries,
          lineStyle: {
            color: COLORS.cyan,
            width: 1,
            opacity: 0.3,
            curveness: 0.2,
          },
          effect: {
            show: true,
            period: 6,
            trailLength: 0.3,
            symbol: 'arrow',
            symbolSize: 5,
            color: '#00e676',
          },
          zlevel: 4,
        },
        // 车辆位置
        {
          type: 'scatter',
          coordinateSystem: 'geo',
          data: vehicleScatter,
          zlevel: 2,
        },
      ],
    };

    chart.setOption(opt);
    return chart;
  }

  /* ================ 柱状图 ================ */
  function renderBar(domId, data) {
    const dom = document.getElementById(domId);
    if (!dom) return null;

    const chart = echarts.init(dom);
    const opt = {
      ...baseOption(),
      xAxis: {
        type: 'category',
        data: data.categories,
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
        axisTick: { show: false },
        axisLabel: {
          color: '#8899cc',
          fontSize: 10,
          rotate: data.categories.length > 6 ? 20 : 0,
        },
      },
      yAxis: {
        type: 'value',
        name: '万元',
        nameTextStyle: { color: '#6678a0', fontSize: 10 },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } },
        axisLabel: { color: '#6678a0', fontSize: 10 },
      },
      series: [{
        type: 'bar',
        barWidth: '50%',
        data: data.values.map((v, i) => ({
          value: v,
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: COLOR_LIST[i % COLOR_LIST.length] },
              { offset: 1, color: 'rgba(10, 20, 70, 0.6)' },
            ]),
          },
        })),
        emphasis: {
          itemStyle: { shadowBlur: 12, shadowColor: 'rgba(0, 210, 255, 0.5)' },
        },
      }],
      grid: { top: 16, right: 20, bottom: 20, left: 52 },
    };

    chart.setOption(opt);
    return chart;
  }

  /* ================ 饼图（环形） ================ */
  function renderPie(domId, data) {
    const dom = document.getElementById(domId);
    if (!dom) return null;

    const chart = echarts.init(dom);
    const opt = {
      ...baseOption(),
      legend: {
        orient: 'vertical',
        right: 8,
        top: 'center',
        textStyle: { color: '#8899cc', fontSize: 11 },
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 12,
      },
      series: [{
        type: 'pie',
        radius: ['52%', '78%'],
        center: ['38%', '50%'],
        avoidLabelOverlap: false,
        padAngle: 2,
        itemStyle: {
          borderRadius: 6,
          borderColor: 'rgba(7, 11, 36, 1)',
          borderWidth: 3,
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}\n{d}%',
          color: '#8899cc',
          fontSize: 10,
        },
        labelLine: {
          length: 18,
          length2: 24,
          lineStyle: { color: 'rgba(255,255,255,0.15)' },
        },
        emphasis: {
          label: { fontSize: 14, fontWeight: 'bold' },
          scaleSize: 8,
          shadowBlur: 16,
          shadowColor: 'rgba(0,0,0,0.4)',
        },
        data: data.map((it, i) => ({
          ...it,
          itemStyle: { color: COLOR_LIST[i % COLOR_LIST.length] },
        })),
      }],
    };

    chart.setOption(opt);
    return chart;
  }

  /* ---- resize ---- */
  function resizeAll(charts) {
    charts.forEach((c) => c && c.resize && c.resize());
  }

  return { renderTrend, renderBar, renderPie, renderMap, resizeAll };
})();
