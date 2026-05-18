import ApexCharts from 'apexcharts';

export async function exportPNG(
  chart: ApexCharts | null,
  filename: string
) {
  try {
    if (!chart) return;

    const result = await chart.dataURI();

    if (!('imgURI' in result)) return;

    const link = document.createElement('a');

    link.href = result.imgURI;
    link.download = `${filename}.png`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error(error);
  }
}

export function exportSVG(
  container: HTMLElement | null,
  filename: string
) {
  try {
    if (!container) return;

    const svg = container.querySelector('svg');

    if (!svg) return;

    const serializer = new XMLSerializer();

    let source = serializer.serializeToString(svg);

    if (
      !source.match(
        /^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/
      )
    ) {
      source = source.replace(
        '<svg',
        '<svg xmlns="http://www.w3.org/2000/svg"'
      );
    }

    const blob = new Blob([source], {
      type: 'image/svg+xml;charset=utf-8',
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;
    link.download = `${filename}.svg`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
  }
}

export function exportCSV(
  headers: string[],
  rows: (string | number)[][],
  filename: string
) {
  try {
    let csv = '';

    csv += headers.join(',');
    csv += '\n';

    rows.forEach((row) => {
      csv += row.join(',');
      csv += '\n';
    });

    const blob = new Blob(
      ['\uFEFF' + csv],
      {
        type: 'text/csv;charset=utf-8;',
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;
    link.download = `${filename}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
  }
}