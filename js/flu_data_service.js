class FluDataService {
  constructor() {
    this.fluData = [];
    this.callbacks = [];
  }

  subscribe(callback) {
    this.callbacks.push(callback);
  }

  applyFilter(options) {
    const filterOptions = Object.assign({
      stateName: null,
      ageRange: null,
      gender: null
    }, options);
    const filteredData = this.fluData.map(data => {
      const { stateName, ageRange, gender } = filterOptions;
      let withinAgeRange = false;
      if (ageRange) {
        const [minAge, maxAge] = ageRange;
        withinAgeRange = data.age >= minAge && data.age < maxAge;
      }
      const enabled = stateName === data.stateName ||
        gender === data.gender || withinAgeRange;
      return { ...data, enabled };
    });
    this._publish(filteredData);
  }

  init() {
    d3.json('js/flu_data.json', (error, jsonFluData) => {
      this.fluData = jsonFluData;
      this.reset();
    });
  }

  reset() {
    this.fluData = this.fluData.map(data => ({ ...data, enabled: true }));
    this._publish(this.fluData);    
  }

  _publish(data) {
    this.callbacks.forEach((callback) => {
      callback(data);
    });
  }
}