class RankingsTable {
  constructor(rootEl, fluDataService) {
    const tbodyEl = rootEl.getElementsByTagName('tbody')[0];
    this.bodyRows = Array.from(tbodyEl.getElementsByTagName('tr'));
    this.fluDataService = fluDataService;
  }

  update(sortedStateData) {
    this.bodyRows.forEach((rowEl, i) => {
      if (i + 1 > sortedStateData.length) {
        rowEl.classList.add('hidden');
      } else {
        const iStateData = sortedStateData[i];
        rowEl.getElementsByClassName('rank')[0].textContent = i + 1;
        rowEl.getElementsByClassName('state')[0].textContent = iStateData.stateName;
        rowEl.getElementsByClassName('num-cases')[0].textContent = iStateData.enabledCount;
        rowEl.classList.remove('hidden');
      }
    })
  }
}