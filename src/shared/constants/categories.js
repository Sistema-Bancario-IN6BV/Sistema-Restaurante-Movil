export const CATEGORIES = [
  { value: 'ITALIANA', icon: 'local-pizza' },
  { value: 'MEXICANA', icon: 'local-fire-department' },
  { value: 'JAPONESA', icon: 'set-meal' },
  { value: 'CHINA', icon: 'rice-bowl' },
  { value: 'FRANCESA', icon: 'bakery-dining' },
  { value: 'AMERICANA', icon: 'lunch-dining' },
  { value: 'GUATEMALTECA', icon: 'restaurant' },
  { value: 'MARISCOS', icon: 'set-meal' },
  { value: 'VEGETARIANA', icon: 'eco' },
  { value: 'VEGANA', icon: 'eco' },
  { value: 'PARRILLA', icon: 'outdoor-grill' },
  { value: 'PIZZERIA', icon: 'local-pizza' },
  { value: 'CAFE', icon: 'local-cafe' },
  { value: 'SUSHI', icon: 'set-meal' },
  { value: 'TAPAS', icon: 'tapas' },
  { value: 'FUSION', icon: 'restaurant-menu' },
  { value: 'PERUANA', icon: 'restaurant' },
  { value: 'OTRA', icon: 'restaurant' }
];

export const MENU_TYPES = ['STARTER', 'APPETIZER', 'SOUP', 'SALAD', 'MAIN', 'SIDE', 'DESSERT', 'DRINK'];

export const formatCategory = (category) => {
  if (!category) return '';
  return category.charAt(0) + category.slice(1).toLowerCase();
};
