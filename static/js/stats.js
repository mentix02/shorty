function shuffle(a) {
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

let logic = function(e) {
    e.preventDefault();
    let link = $('#link').val();
    $.ajax({
        type: 'POST',
        url: '/graphql/',
        contentType: 'application/json',
        data: JSON.stringify({
            query: `{
              url(urlHash: "${link}") {
                fullUrl
                clicks {
                  ip
                  os
                  device
                  browser
                  timestamp
                }
              }
            }`
        }),
        success: function(res) {
            const err_msg = $('#error-msg')
            if (res['errors']) {
                err_msg.removeClass('hidden');
                return;
            }
            err_msg.addClass('hidden');

            clicks = res.data.url['clicks'];

            clicks.forEach(element => {
                element.timestamp = new Date(element.timestamp);
            });

            let os_data      = {};
            let click_data   = {};
            let device_data  = {};
            let browser_data = {};

            clicks.forEach(function(el) {

                if (click_data[el.timestamp.toLocaleDateString()])
                    click_data[el.timestamp.toLocaleDateString()]++;
                else
                    click_data[el.timestamp.toLocaleDateString()] = 1;

                if (os_data[el.os])
                    os_data[el.os]++;
                else
                    os_data[el.os] = 1;

                if (device_data[el.device])
                    device_data[el.device]++;
                else
                    device_data[el.device] = 1;

                if (browser_data[el.browser])
                    browser_data[el.browser]++;
                else
                    browser_data[el.browser] = 1;

            });

            let dates = Object.entries(click_data);
            dates.sort(function(a, b) {

                const d1 = new Date(a[0]);
                const d2 = new Date(b[0]);

                if (d1 > d2) return 1;
                if (d2 > d1) return -1;

                return 0;
            });

            let colors = [
                ['rgba(255, 99, 132, 0.2)', 'rgba(255, 99, 132, 1)',],
                ['rgba(54, 162, 235, 0.2)', 'rgba(54, 162, 235, 1)',],
                ['rgba(75, 192, 192, 0.2)', 'rgba(75, 192, 192, 1)',],
                ['rgba(153, 102, 255, 0.2)', 'rgba(153, 102, 255, 1)',],
                ['rgba(255, 159, 64, 0.2)', 'rgba(255, 159, 64, 1)']
            ];

            colors = shuffle(colors);

            Chart.defaults.global.elements.rectangle.backgroundColor = colors[0];
            Chart.defaults.global.elements.rectangle.borderColor = colors[1];

            Chart.defaults.global.elements.line.backgroundColor = colors[0];
            Chart.defaults.global.elements.line.borderColor = colors[1];

            let clickChartData = {
                labels: dates.map(function(el) { return el[0] }),
                datasets: [{
                    label: 'clicks',
                    maxBarThickness: '45',
                    data: dates.map(function(el) { return el[1] }),
                    borderWidth: 1
                }]
            };

            /* const backgroundColor = [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ];
            const borderColor = [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ]; */

            new Chart(clickChart, {
                type: 'line',
                data: clickChartData,
                options: {
                    responsive: true,
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Daily Clicks',
                        fontSize: 20
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                                callback: function(value) {if (value % 1 === 0) {return value;}}
                            }
                        }]
                    }
                }
            });

            colors = shuffle(colors);
            new Chart(osChart, {
                type: 'doughnut',
                responsive: true,
                data: {
                    labels: Object.keys(os_data),
                    datasets: [{
                        label: 'OS',
                        data: Object.values(os_data),
                        borderWidth: 1,
                        backgroundColor: colors.map(function(el) { return el[0] }),
                        borderColor: colors.map(function(el) { return el[1] })
                    }]
                },
                options: {
                    title: {
                        display: true,
                        text: 'Operating Systems',
                        fontSize: 20
                    },
                }
            });

            colors = shuffle(colors);
            new Chart(deviceChart, {
                type: 'polarArea',
                responsive: true,
                data: {
                    labels: Object.keys(device_data),
                    datasets: [{
                        label: 'Device',
                        data: Object.values(device_data),
                        borderWidth: 1,
                        backgroundColor: colors.map(function(el) { return el[0] }),
                        borderColor: colors.map(function(el) { return el[1] })
                    }]
                },
                options: {
                    title: {
                        display: true,
                        text: 'Devices',
                        fontSize: 20
                    },
                }
            });

            colors = shuffle(colors);
            new Chart(browserChart, {
                type: 'pie',
                responsive: true,
                data: {
                    labels: Object.keys(browser_data),
                    datasets: [{
                        label: 'Device',
                        data: Object.values(browser_data),
                        borderWidth: 1,
                        backgroundColor: colors.map(function(el) { return el[0] }),
                        borderColor: colors.map(function(el) { return el[1] })
                    }]
                },
                options: {
                    title: {
                        display: true,
                        text: 'Browsers',
                        fontSize: 20
                    },
                }
            });

        }
    });
}

let clicks;
const osChart = $('#osChart');
const mainForm = $('#main-form');
const clickChart = $('#clickChart');
const deviceChart = $('#deviceChart');
const browserChart = $('#browserChart');

Chart.defaults.global.responsive = true;

mainForm.submit(function(e) {
    logic(e);
});

const url = new URL(document.location.href);
if (url.searchParams.get('hash'))
    mainForm.submit();
