export default async function importLime() {
  return new Promise((resolve, reject) => {
    let input = document.createElement('input');
    input.type = 'file';
    input.style.display = 'none';
    input.accept = 'accept="application/json';
    document.body.appendChild(input);

    input.addEventListener('change', (e) => {
      const file = e.target.files[0];

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = JSON.parse(event.target.result);
        resolve(result);
      }
      reader.onerror = (e) => {
        reject(e);
      }
      reader.readAsText(file);
    });

    input.click();
  });
}
