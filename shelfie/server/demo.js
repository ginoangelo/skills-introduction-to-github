// Canned results used when no Anthropic credentials are configured. They let
// the full scan -> pantry -> cook -> shop flow be tried without an API key.

const item = (name, category, quantity, brand = '', expires = null, confidence = 'high') =>
  ({ name, category, quantity, brand, expires, confidence });

const inDays = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);

const SCANS = {
  fridge: () => [
    item('eggs', 'dairy', '8', '', inDays(12)),
    item('whole milk', 'dairy', 'half a carton', 'Meadow Lane', inDays(3)),
    item('cheddar cheese', 'dairy', '1 block'),
    item('butter', 'dairy', '1 stick'),
    item('spinach', 'produce', '1 bag', '', inDays(2), 'medium'),
    item('bell pepper', 'produce', '2'),
    item('scallions', 'produce', '1 bunch', '', null, 'medium'),
    item('chicken thighs', 'meat', '1 pack', '', inDays(1)),
    item('tortillas', 'grains', '6'),
    item('salsa', 'condiments', 'half a jar', 'Casa Roja'),
    item('soy sauce', 'condiments', '1 bottle'),
    item('lemon', 'produce', '1', '', null, 'low'),
  ],
  freezer: () => [
    item('frozen peas', 'frozen', '1 bag'),
    item('frozen shrimp', 'seafood', 'half a bag'),
    item('ground beef', 'meat', '1 lb'),
    item('frozen berries', 'frozen', '1 bag', '', null, 'medium'),
  ],
  cabinet: () => [
    item('spaghetti', 'grains', '1 box', 'Nonna Rosa'),
    item('rice', 'grains', '1 bag'),
    item('black beans', 'canned', '2 cans'),
    item('canned tomatoes', 'canned', '1 can'),
    item('olive oil', 'condiments', '1 bottle'),
    item('garlic', 'produce', '1 head'),
    item('yellow onion', 'produce', '3'),
    item('rolled oats', 'grains', '1 canister'),
    item('peanut butter', 'condiments', '1 jar'),
    item('cumin', 'spices', '1 jar', '', null, 'medium'),
    item('chili flakes', 'spices', '1 jar'),
    item('flour', 'baking', '1 bag'),
  ],
};

export function demoScan(location) {
  return { items: (SCANS[location] || SCANS.fridge)(), unidentified: ['a jar with the label turned away'] };
}

const BOOK = [
  { title: 'Cheesy Spinach Scramble', blurb: 'Soft eggs folded with wilted spinach and sharp cheddar.', minutes: 10, servings: 2, difficulty: 'easy',
    needs: ['eggs', 'spinach', 'cheddar', 'butter'],
    steps: ['Melt butter in a non-stick pan over medium-low heat.', 'Wilt the spinach for a minute.', 'Pour in beaten, seasoned eggs and stir gently until just set.', 'Fold in grated cheddar and serve right away.'] },
  { title: 'Chicken & Pepper Quesadillas', blurb: 'Crisp tortillas stuffed with juicy chicken, peppers and melty cheese.', minutes: 25, servings: 2, difficulty: 'easy',
    needs: ['chicken', 'bell pepper', 'tortillas', 'cheddar', 'salsa'],
    steps: ['Season and sear chopped chicken thighs until cooked through.', 'Soften sliced peppers in the same pan.', 'Fill tortillas with chicken, peppers and cheese; fold.', 'Toast each side until golden. Serve with salsa.'] },
  { title: 'Garlic Chili Spaghetti', blurb: 'A five-ingredient weeknight classic with a gentle kick.', minutes: 15, servings: 2, difficulty: 'easy',
    needs: ['spaghetti', 'garlic', 'olive oil', 'chili flakes'],
    steps: ['Boil spaghetti in well-salted water.', 'Gently sizzle sliced garlic and chili flakes in olive oil.', 'Toss the pasta in the oil with a splash of pasta water until glossy.'] },
  { title: 'Black Bean Rice Bowl', blurb: 'Cumin-spiced beans over fluffy rice with a spoon of salsa.', minutes: 25, servings: 2, difficulty: 'easy',
    needs: ['rice', 'black beans', 'onion', 'cumin', 'salsa'],
    steps: ['Cook the rice.', 'Soften chopped onion, add cumin, then the beans with a splash of their liquid.', 'Simmer 5 minutes, spoon over rice and top with salsa.'] },
  { title: 'Egg Fried Rice', blurb: 'Day-old rice turned into something you would order.', minutes: 15, servings: 2, difficulty: 'easy',
    needs: ['rice', 'eggs', 'peas', 'soy sauce', 'scallions'],
    steps: ['Scramble eggs in a hot oiled wok and set aside.', 'Fry cooked rice until it starts to toast.', 'Add peas, soy sauce and the eggs; toss with scallions.'] },
  { title: 'Lemon Garlic Shrimp Pasta', blurb: 'Bright, buttery and on the table in the time it takes to boil pasta.', minutes: 20, servings: 2, difficulty: 'medium',
    needs: ['spaghetti', 'shrimp', 'garlic', 'butter', 'lemon'],
    steps: ['Boil the spaghetti.', 'Sauté garlic in butter, add shrimp and cook until pink.', 'Toss with pasta, lemon juice and a little pasta water.'] },
  { title: 'Beef & Bean Chili', blurb: 'A rich one-pot chili that gets better tomorrow.', minutes: 45, servings: 4, difficulty: 'medium',
    needs: ['ground beef', 'black beans', 'canned tomatoes', 'onion', 'cumin', 'chili flakes'],
    steps: ['Brown the beef with chopped onion.', 'Stir in cumin and chili flakes for a minute.', 'Add tomatoes and beans; simmer 30 minutes, seasoning to taste.'] },
  { title: 'Peanut Butter Berry Oats', blurb: 'Creamy oats with a swirl of peanut butter and jammy berries.', minutes: 8, servings: 1, difficulty: 'easy',
    needs: ['oats', 'milk', 'peanut butter', 'berries'],
    steps: ['Simmer oats in milk until creamy.', 'Warm the berries until they burst.', 'Top the oats with berries and a spoon of peanut butter.'] },
  { title: 'Creamy Tomato Pasta', blurb: 'Pantry tomatoes mellowed with a splash of cream.', minutes: 20, servings: 2, difficulty: 'easy',
    needs: ['spaghetti', 'canned tomatoes', 'garlic', 'onion', 'cream'],
    steps: ['Soften onion and garlic.', 'Add tomatoes and simmer 10 minutes.', 'Stir in cream and toss with cooked pasta.'] },
  { title: 'Chicken Coconut Curry', blurb: 'Tender chicken in a fragrant coconut sauce over rice.', minutes: 35, servings: 3, difficulty: 'medium',
    needs: ['chicken', 'onion', 'garlic', 'rice', 'coconut milk', 'curry paste'],
    steps: ['Brown the chicken; set aside.', 'Fry onion, garlic and curry paste.', 'Add coconut milk and chicken; simmer 15 minutes. Serve over rice.'] },
  { title: 'Spinach & Feta Omelette', blurb: 'A salty, tangy upgrade to the usual omelette.', minutes: 10, servings: 1, difficulty: 'easy',
    needs: ['eggs', 'spinach', 'butter', 'feta'],
    steps: ['Wilt spinach in butter.', 'Pour over beaten eggs and cook until nearly set.', 'Crumble in feta, fold and serve.'] },
  { title: 'Shrimp Tacos with Lime', blurb: 'Quick-seared shrimp in warm tortillas with a squeeze of lime.', minutes: 15, servings: 2, difficulty: 'easy',
    needs: ['shrimp', 'tortillas', 'salsa', 'lime', 'avocado'],
    steps: ['Sear seasoned shrimp 2 minutes a side.', 'Warm the tortillas.', 'Fill with shrimp, sliced avocado, salsa and lime juice.'] },
];

const BUY_REASONS = {
  'coconut milk': 'Turns the chicken, rice and aromatics you already have into curries and soups.',
  'curry paste': 'One jar gives your chicken and rice a whole new set of dinners.',
  cream: 'A small carton makes your pasta and tomatoes into silky sauces.',
  feta: 'Adds a salty punch to your eggs, spinach and pasta.',
  lime: 'Brightens tacos, rice bowls and anything from the freezer.',
  avocado: 'Pairs with your tortillas, eggs and beans for fast lunches.',
};

export function demoSuggest(pantry) {
  const have = pantry.map((p) => p.name.toLowerCase());
  const has = (need) => have.some((h) => h.includes(need) || need.includes(h));
  const recipes = [];
  const unlocks = new Map();

  for (const r of BOOK) {
    const uses = r.needs.filter(has);
    const missing = r.needs.filter((n) => !has(n));
    if (missing.length > 3 || uses.length === 0) continue;
    recipes.push({
      title: r.title, blurb: r.blurb, status: missing.length ? 'almost' : 'ready',
      minutes: r.minutes, servings: r.servings, difficulty: r.difficulty, uses, missing, steps: r.steps,
    });
    for (const m of missing) unlocks.set(m, [...(unlocks.get(m) || []), r.title]);
  }
  recipes.sort((a, b) => a.missing.length - b.missing.length || a.minutes - b.minutes);

  const smartBuys = [...unlocks.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 4)
    .map(([it, dishes]) => ({
      item: it,
      why: BUY_REASONS[it] || 'Fills the one gap between your pantry and several more dishes.',
      unlocks: dishes.slice(0, 4),
    }));

  return { recipes: recipes.slice(0, 8), smartBuys };
}
