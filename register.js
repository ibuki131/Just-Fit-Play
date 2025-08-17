async function loadPrefectures() {
    const response = await fetch('./data/pref_city.json');
    const data = await response.json();
    const prefSelect = document.getElementById('pref');

    for (const pref in data) {
        const option = document.createElement('option');
        option.value = pref;
        option.textContent = pref;
        prefSelect.appendChild(option);
    }

    window.prefData = data; // グローバル変数として保存
}

function updateCities() {
    const prefSelect = document.getElementById('pref');
    const citySelect = document.getElementById('city');
    const selectedPref = prefSelect.value;

    citySelect.innerHTML = '<option value="">市区町村を選択してください</option>';

    if (selectedPref && window.prefData) {
        const cities = window.prefData[selectedPref];
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
    }
}

loadPrefectures();
