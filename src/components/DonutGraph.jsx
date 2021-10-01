import PropTypes from 'prop-types';
import Chart from 'react-apexcharts';

export default function DonutGraph({ responseData, responseLabels }) {
  const series = responseData;
  const options = {
    chart: {
      height: 390,
      type: 'donut',
    },
    tooltip: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        startAngle: -90,
        endAngle: 270,
        donut: {
          labels: {
            show: true,
            value: {
              color: 'white',
              fontSize: '20px',
              fontWeight: 550,
            },
            total: {
              show: true,
              label: 'TOTAL',
              fontSize: '22px',
              fontWeight: 600,
              color: 'white',
              formatter() {
                return series.reduce((a, b) => a + b, 0);
              },
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    fill: {
      type: 'gradient',
    },
    colors: [
      '#21b459',
      '#ff5556',
      '#4b8df0',
      '#86cd74',
      '#ffbe59',
      '#7eaef4',
      '#a7a93d',
      '#f49624',
    ],
    labels: responseLabels,
    legend: {
      show: true,
      fontSize: '14px',
      labels: {
        useSeriesColors: true,
      },
      formatter(val) {
        return `${val}`;
      },
      itemMargin: {
        vertical: 3,
      },
    },
    title: {
      text: 'Hacker Application Responses',
      offsetY: -5,
      style: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: 'white',
      },
    },
    responsive: [
      {
        breakpoint: 487, // Half the distance between 325 and 650
        options: {
          chart: {
            width: 325, // Half of original width
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  };

  return (
    <>
      <Chart options={options} series={series} type="donut" width={700} />
    </>
  );
}

DonutGraph.propTypes = {
  responseData: PropTypes.arrayOf(PropTypes.number),
  responseLabels: PropTypes.arrayOf(PropTypes.string),
};
