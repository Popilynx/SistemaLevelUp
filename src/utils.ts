export const createPageUrl = (page: string): string => {
  const pageMap: { [key: string]: string } = {
    'Home': '/',
    'GoodHabits': '/good-habits',
    'BadHabits': '/bad-habits',
    'Objectives': '/objectives',
    'Skills': '/skills',
    'CharacterSettings': '/character-settings',
    'ActivityLog': '/activity-log',
    'Market': '/market',
    'Inventory': '/inventory',
  };

  return pageMap[page] || '/';
};
