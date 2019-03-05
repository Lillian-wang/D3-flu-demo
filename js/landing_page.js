function LandingPageInit() {
  const fluDataService = new FluDataService();

  // Setup US map.
  setupUSFluMap(fluDataService);

  // Set up rankings table
  setupRankingsTable(fluDataService);

  // Set up Age bar chart.
  setupAgeRangeChart(fluDataService);

  // Setup Gender Ratio Pie.
  setupGenderRatioChart(fluDataService);

  setupResetButton(fluDataService);

  fluDataService.init();
}

function setupResetButton(fluDataService) {
  const resetButton = document.getElementById('reset-charts-btn');
  resetButton.addEventListener('click', () => {
    fluDataService.reset();
  });

  fluDataService.subscribe(data => {
    const needToRefresh = data.some(person => {
      return !person.enabled;
    });
    resetButton.classList.toggle('invisible', !needToRefresh);
  });
}

function setupUSFluMap(fluDataService) {
  const [minColor, maxColor] = ['#edfca1', '#db1360'];
  const usMap = new USFluMap(d3.select('#us-map'), fluDataService, [minColor, maxColor]);
  let maxPopulation = 0;
  fluDataService.subscribe(data => {
    mapData = {};
    const nestedInfo = d3.nest().key(patientInfo => patientInfo.stateName).entries(data);
    nestedInfo.forEach(stateInfo => {
      const statePopulation = stateInfo.values.length;
      const enabled = stateInfo.values.reduce((acc, currentItem) => {
        if (!currentItem.enabled) {
          return acc;
        }
        return ++acc;
      }, 0);

      if (enabled) {
        maxPopulation = Math.max(maxPopulation, statePopulation);
      }
      mapData[stateInfo.key] = {
        enabled,
        statePopulation
      };
    });
    usMap.update(mapData, maxPopulation);
  });
}

function setupRankingsTable(fluDataService) {
  const rankingsTable = new RankingsTable(
    document.getElementById('rankings-table'), fluDataService, 5);
  fluDataService.subscribe(data => {
    const mapDataList = [];
    const enabledData = data.filter(iData => iData.enabled);
    const nestedInfo = d3.nest().key(patientInfo => patientInfo.stateName).entries(enabledData);
    nestedInfo.forEach(stateInfo => {
      const enabledCount = stateInfo.values.reduce((acc, currentItem) => {
        if (!currentItem.enabled) {
          return acc;
        }
        return ++acc;
      }, 0);
      const statePopulation = stateInfo.values.length;
      mapDataList.push({
        stateName: stateInfo.key,
        enabledCount,
        statePopulation,
      });
    });
    mapDataList.sort((a, b) => {
      return b.enabledCount - a.enabledCount;
    })
    rankingsTable.update(mapDataList);
  });
}

function setupAgeRangeChart(fluDataService) {
  const ageBarChart = new AgeRangeChart(
    d3.select('#age-distribution-bar'), fluDataService, [50, 20, 30, 40])
  fluDataService.subscribe(data => {
    const ageRangesInfo = [
      new ageRangeEntry([0, 9]), new ageRangeEntry([10, 19]),
      new ageRangeEntry([20, 34]),
      new ageRangeEntry([35, 44]), new ageRangeEntry([45, 54]),
      new ageRangeEntry([55, 64]), new ageRangeEntry([65, 74]),
      new ageRangeEntry([75, 84]), new ageRangeEntry([85, 100])
    ];
    data.forEach(person => {
      const age = person.age;
      const selectedRangeIndex = ageRangesInfo.findIndex(range => {
        return (age >= range.minAge && age <= range.maxAge);
      });
      const selectedRange = ageRangesInfo[selectedRangeIndex];
      selectedRange.totalCount++;
      if (person.enabled) {
        selectedRange.totalEnabled++;
      }
    });
    ageBarChart.update(ageRangesInfo);
  })
}

function setupGenderRatioChart(fluDataService) {
  const genderRatioPie = new GenderRatioPie(
    d3.select('#gender-ratio-pie'), fluDataService,
    200, {
      f: '#891a62',
      m: '#39a36f'
    });
  fluDataService.subscribe(data => {
    const enabledData = data.filter(iData => iData.enabled);
    const [totalFemales, totalMales] = enabledData.reduce((acc, currentItem) => {
      const [femaleCount, maleCount] = acc;
      if (currentItem.gender === 'f') {
        return [femaleCount + 1, maleCount];
      } else {
        return [femaleCount, maleCount + 1];
      }
    }, [0, 0]);
    const totalCount = totalFemales + totalMales;
    const genderData = [{
      gender: 'f',
      genderCount: totalFemales,
      totalCount
    }, {
      gender: 'm',
      genderCount: totalMales,
      totalCount
    }];
    genderRatioPie.update(genderData);
  });
}