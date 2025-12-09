document.addEventListener('DOMContentLoaded', function() {
    // Getting chart data from embedded JSON
    const chartDataElement = document.getElementById('chartData');
    if (!chartDataElement) {
        console.error('Chart data not found');
        return;
    }

    const chartData = JSON.parse(chartDataElement.textContent);

    // Setting up Chart.js default configuration
    Chart.defaults.font.family = 'Arial, Helvetica, sans-serif';
    Chart.defaults.font.size = 12;
    Chart.defaults.color = '#666';
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false;

    // Detecting screen size for responsive adjustments
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

    // Defining color palettes for charts
    const colorPalette = [
        'rgba(102, 126, 234, 0.8)',
        'rgba(118, 75, 162, 0.8)',
        'rgba(237, 100, 166, 0.8)',
        'rgba(255, 154, 158, 0.8)',
        'rgba(250, 208, 196, 0.8)',
        'rgba(79, 172, 254, 0.8)',
        'rgba(0, 242, 254, 0.8)',
        'rgba(132, 250, 176, 0.8)'
    ];

    const borderColorPalette = [
        'rgba(102, 126, 234, 1)',
        'rgba(118, 75, 162, 1)',
        'rgba(237, 100, 166, 1)',
        'rgba(255, 154, 158, 1)',
        'rgba(250, 208, 196, 1)',
        'rgba(79, 172, 254, 1)',
        'rgba(0, 242, 254, 1)',
        'rgba(132, 250, 176, 1)'
    ];

    // Storing chart instances for cleanup
    const chartInstances = [];

    // Creating Assets by Type Chart (Doughnut)
    const assetsByTypeCtx = document.getElementById('assetsByTypeChart');
    if (assetsByTypeCtx && chartData.assetsByType && chartData.assetsByType.length > 0) {
        const chart1 = new Chart(assetsByTypeCtx, {
            type: 'doughnut',
            data: {
                labels: chartData.assetsByType.map(item => item.type_name),
                datasets: [{
                    label: 'Assets Count',
                    data: chartData.assetsByType.map(item => parseInt(item.count)),
                    backgroundColor: colorPalette,
                    borderColor: borderColorPalette,
                    borderWidth: 2,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: isMobile ? 'bottom' : 'right',
                        labels: {
                            padding: isMobile ? 10 : 15,
                            boxWidth: isMobile ? 10 : 12,
                            font: {
                                size: isMobile ? 10 : 12
                            }
                        }
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true
                }
            }
        });
        chartInstances.push(chart1);
    }

    // Creating Assets by Status Chart (Pie)
    const assetsByStatusCtx = document.getElementById('assetsByStatusChart');
    if (assetsByStatusCtx && chartData.assetsByStatus && chartData.assetsByStatus.length > 0) {
        const chart2 = new Chart(assetsByStatusCtx, {
            type: 'pie',
            data: {
                labels: chartData.assetsByStatus.map(item => item.status_name),
                datasets: [{
                    label: 'Assets Count',
                    data: chartData.assetsByStatus.map(item => parseInt(item.count)),
                    backgroundColor: colorPalette,
                    borderColor: borderColorPalette,
                    borderWidth: 2,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: isMobile ? 'bottom' : 'right',
                        labels: {
                            padding: isMobile ? 10 : 15,
                            boxWidth: isMobile ? 10 : 12,
                            font: {
                                size: isMobile ? 10 : 12
                            }
                        }
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true
                }
            }
        });
        chartInstances.push(chart2);
    }

    // Creating Assets by Branch Chart (Bar)
    const assetsByBranchCtx = document.getElementById('assetsByBranchChart');
    if (assetsByBranchCtx && chartData.assetsByBranch && chartData.assetsByBranch.length > 0) {
        const chart3 = new Chart(assetsByBranchCtx, {
            type: 'bar',
            data: {
                labels: chartData.assetsByBranch.map(item => item.branch_name),
                datasets: [{
                    label: 'Number of Assets',
                    data: chartData.assetsByBranch.map(item => parseInt(item.count)),
                    backgroundColor: 'rgba(102, 126, 234, 0.7)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 2,
                    borderRadius: 8,
                    hoverBackgroundColor: 'rgba(102, 126, 234, 0.9)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            font: {
                                size: isMobile ? 10 : 12
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: isMobile ? 10 : 12
                            },
                            maxRotation: isMobile ? 45 : 0,
                            minRotation: isMobile ? 45 : 0
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            afterLabel: function(context) {
                                const index = context.dataIndex;
                                const value = chartData.assetsByBranch[index].total_value;
                                if (value) {
                                    return `Total Value: Ksh. ${parseFloat(value).toLocaleString()}`;
                                }
                                return '';
                            }
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });
        chartInstances.push(chart3);
    }

    // Creating Monthly Expenses Chart (Line)
    const monthlyExpensesCtx = document.getElementById('monthlyExpensesChart');
    if (monthlyExpensesCtx && chartData.monthlyExpenses && chartData.monthlyExpenses.length > 0) {
        const chart4 = new Chart(monthlyExpensesCtx, {
            type: 'line',
            data: {
                labels: chartData.monthlyExpenses.map(item => item.month),
                datasets: [{
                    label: 'Monthly Expenses (Ksh)',
                    data: chartData.monthlyExpenses.map(item => parseFloat(item.total)),
                    backgroundColor: 'rgba(245, 87, 108, 0.1)',
                    borderColor: 'rgba(245, 87, 108, 1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: isMobile ? 3 : 5,
                    pointBackgroundColor: 'rgba(245, 87, 108, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: isMobile ? 5 : 7,
                    pointHoverBackgroundColor: 'rgba(245, 87, 108, 1)',
                    pointHoverBorderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'Ksh. ' + value.toLocaleString();
                            },
                            font: {
                                size: isMobile ? 10 : 12
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: isMobile ? 10 : 12
                            },
                            maxRotation: isMobile ? 45 : 0,
                            minRotation: isMobile ? 45 : 0
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: !isMobile,
                        position: 'top',
                        labels: {
                            font: {
                                size: isMobile ? 10 : 12
                            }
                        }
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            label: function(context) {
                                return 'Ksh. ' + context.parsed.y.toLocaleString();
                            }
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });
        chartInstances.push(chart4);
    }

    // Handling window resize for responsive charts
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            chartInstances.forEach(chart => {
                if (chart) {
                    chart.resize();
                }
            });
        }, 250);
    });

    console.log('Dashboard charts initialized successfully');
    console.log(`Total charts created: ${chartInstances.length}`);
});
