const tierSettings = [
  { tier: 0, extensions: ['RTF', 'TXT', 'MMD'] },
  { tier: 1, extensions: ['JPG', 'PNG', 'GIF', 'PDF'] },
];

export function fileExtension(fileName) {
  const index = fileName.lastIndexOf('.');
  if (index < 0) {
    return '?';
  }
  return fileName.substr(index + 1);
}

export function fileType(fileName) {
  const upperCaseExtension = fileExtension(fileName).toUpperCase();
  for (let i = 0; i < tierSettings.length; i += 1) {
    const { tier, extensions } = tierSettings[i];
    if (extensions.indexOf(upperCaseExtension) >= 0) {
      return tier;
    }
  }
  return -1;
}
