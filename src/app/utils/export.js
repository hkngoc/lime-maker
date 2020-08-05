export default function exportLime(lime) {
  if (lime instanceof Array) {
    var title = "limes";
  } else {
    title = lime.title;
  }

  const fileData = JSON.stringify(lime, null, 2);
  const blob = new Blob([fileData], {type: "text/plain"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${title}.json`;
  link.href = url;
  link.click();
}