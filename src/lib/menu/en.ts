import type { LanguageMenu } from "./types";

/**
 * English menu, transcribed from the Em Sherif Café Erbil printed menu.
 * Prices are in Iraqi dinar.
 *
 * Five prices here are deliberately not the printed ones, by the client's
 * decisions on disagreements between the printed menus: Fassoulya bi Lahmeh
 * (§1) and four Hot Beverages re-paired to the Arabic page (§2), each commented
 * where it sits. See docs/menu-discrepancies.md. Every name, description and
 * other price is the page, character for character.
 */
export const englishMenu: LanguageMenu = {
  food: {
    sections: [
      {
        title: "Furn",
        items: [
          {
            name: "Man'ousheh Zaatar",
            description: "Homemade thyme mix on flat bread",
            price: 7500,
          },
          {
            name: "Man'ousheh Jebneh",
            description: "Homemade cheese mix on flat bread",
            price: 8000,
          },
          {
            name: "Bokjat Jebneh",
            description: "Homemade cheese mix pie, leafy greens",
            price: 14000,
          },
          {
            name: "Mini Lahmeh bi Ajeen | 3 pcs",
            description: "Spicy minced meat pie, pine nuts",
            price: 12000,
          },
          {
            name: "Lahmeh bi Ajeen Debs",
            description: "Minced meat pie with pomegranate molasses, pine nuts",
            price: 12000,
          },
          {
            name: "Musakhan",
            description: "Onion and sumac chicken on flat bread",
            price: 6000,
          },
        ],
      },
      {
        title: "Eggs & Dairy",
        items: [
          { name: "Beyd Ouyoun", description: "Sunny side up eggs", price: 6000 },
          { name: "Beyd Makhfouk", description: "Scrambled eggs", price: 6000 },
          {
            name: "Beyd Soujouk",
            description: "Eggs any style with Lebanese spicy sausage",
            price: 11000,
          },
          {
            name: "Beyd Omelette",
            description: "Three creamy free range eggs, salt, pepper",
            price: 6500,
          },
          {
            name: "Beyd bi Kawarma",
            description: "Eggs any style with lamb confit",
            price: 12000,
          },
          {
            name: "Beyd Shakshouka",
            description: "Eggs any style with tomato and pepper sauce",
            price: 9000,
          },
          {
            name: "Labneh",
            description:
              "Homemade cow's milk labneh, mixed with olives and mint, finished with extra virgin olive oil",
            price: 7500,
          },
          {
            name: "Labneh w Foul Akhdar",
            description: "Homemade labneh and fava beans in extra virgin olive oil",
            price: 8000,
          },
          {
            name: "Halloum",
            description:
              "Pan fried marinated halloumi, sautéed tomato, sesame, wild zaatar",
            price: 14000,
          },
        ],
      },
      {
        title: "Fatteh",
        items: [
          {
            name: "Fattet Hummus",
            description: "Chickpea, yoghurt, crispy Arabic bread, toasted pine nuts",
            price: 12000,
          },
          {
            name: "Fattet Batenjen",
            description:
              "Marinated eggplant, yoghurt, crispy Arabic bread, basil, toasted pine nuts",
            price: 12000,
          },
          {
            name: "Fattet Maftoul",
            description:
              "Spiced pearl semolina dough, yoghurt, crispy Arabic bread, toasted pine nuts",
            price: 12000,
          },
        ],
      },
      {
        title: "Salata",
        items: [
          {
            name: "Tabbouleh",
            description:
              "Chopped parsley, tomato, lemon and extra virgin olive oil dressing",
            price: 12000,
          },
          {
            name: "Fattoush",
            description:
              "Lebanese chopped salad, pomegranate molasses, crispy Arabic bread",
            price: 12000,
          },
          {
            name: "Salata Arabiyeh",
            description: "Leafy greens, onion, apple cider vinegar, sumac",
            price: 11500,
          },
          {
            name: "Shmandar",
            description:
              "Beetroot, cress, caramelized walnut, cumin tahini orange dressing",
            price: 11000,
          },
          {
            name: "Ardishawkeh",
            description:
              "Artichoke, leafy greens, pine nuts, grilled olives, lemon garlic dressing",
            price: 14000,
          },
          {
            name: "Kale Freekeh",
            description:
              "Chopped kale, freekeh, avocado, date, goat cheese, vinegar dressing",
            price: 18000,
          },
          {
            name: "Taouk Salad",
            description:
              "Lettuce, grilled chicken, crispy Arabic bread, grainy mustard dressing",
            price: 18000,
          },
        ],
      },
      {
        title: "Nay",
        items: [
          {
            name: "Kibbeh Nayyeh",
            description: "Creamy Lebanese beef tartar, bulgur, basil",
            price: 24000,
          },
          {
            name: "Frakeh Jnoubiyeh",
            description: "Creamy Lebanese beef tartar, spiced bulgur mix",
            price: 22000,
          },
        ],
      },
      {
        title: "Cold Mezze",
        items: [
          {
            name: "Hummus",
            description: "Chickpea dip, tahini, lemon, extra virgin olive oil",
            price: 10000,
          },
          {
            name: "Hummus with Pine Nuts",
            description:
              "Chickpea dip, tahini, lemon, toasted pine nuts, extra virgin olive oil",
            price: 12500,
          },
          {
            name: "Mutabbal",
            description:
              "Flame grilled eggplant, tahini, lemon, fresh pomegranate, extra virgin olive oil",
            price: 10000,
          },
          {
            name: "Muhammara",
            description: "Roasted sweet pepper and walnut dip, shaved walnut",
            price: 14000,
          },
          {
            name: "Bemieh bil Zeit",
            description: "Okra cooked in tomato and olive oil",
            price: 9000,
          },
          {
            name: "Berghol Banadoura",
            description: "Bulgur cooked in tomato sauce, basil, extra virgin olive oil",
            price: 7500,
          },
          {
            name: "Warak Enab",
            description: "Vegetarian stuffed vine leaves",
            price: 12000,
          },
          {
            name: "Mloukhiyeh bil Zeit",
            description: "Mulukhiyah, tahini, lemon, extra virgin olive oil",
            price: 9500,
          },
          {
            name: "Foul Akhdar bil Zeit",
            description: "Green fava beans, garlic, coriander, extra virgin olive oil",
            price: 9500,
          },
          {
            name: "Adas",
            description: "Lebanese lentil, coriander, pomegranate molasses",
            price: 8500,
          },
          {
            name: "Mousakkaa",
            description: "Eggplant, tomato, onion, basil, extra virgin olive oil",
            price: 9000,
          },
          {
            name: "Sahen Khodra",
            description: "Seasonal vegetables plate",
            price: 5500,
          },
          {
            name: "Raheb",
            description:
              "Flame grilled eggplant, pomegranate, chilli, mint, lemon garlic dressing",
            price: 12000,
          },
          {
            name: "Batata Mahrouseh",
            description: "Potato mash, radish, extra virgin olive oil",
            price: 8500,
          },
          { name: "Sahen Kabis", description: "Selection of pickles", price: 5500 },
        ],
      },
      {
        title: "Hot Mezze",
        items: [
          {
            name: "Hummus Lahmeh",
            description:
              "Chickpea dip, tahini, lemon, minced beef, pine nuts, extra virgin olive oil",
            price: 18000,
          },
          {
            name: "Hummus Soujouk",
            description:
              "Chickpea dip, tahini, lemon, minced spicy sausage, pine nuts, extra virgin olive oil",
            price: 18000,
          },
          {
            name: "Hummus Ras Asfour Harr",
            description:
              "Chickpea dip, sautéed beef, green chilli, spring onion, pine nuts, chilli oil",
            price: 24000,
          },
          {
            name: "Hummus Shawarma",
            description:
              "Hummus, beef shawarma, parsley, onion, tomato, pickled cucumber",
            price: 24000,
          },
          {
            name: "Shawarma Lahmeh",
            description: "Beef shawarma, parsley, onion, tomato, pickled cucumber",
            price: 25000,
          },
          {
            name: "Shawarma Djej",
            description: "Chicken shawarma, garlic cream, pickled cucumber, lettuce",
            price: 22000,
          },
          {
            name: "Kibbeh Sajiyeh",
            description: "Kibbeh filled with ground beef, onions and nuts",
            price: 20000,
          },
          { name: "Sambousik", description: "Meat filled pastries", price: 12000 },
          {
            name: "Fatayer Selek",
            description: "Swiss chard, walnut, onion, zaatar pastries",
            price: 8500,
          },
          {
            name: "Falafel",
            description: "Chickpea and herbs fritters, tahini sauce",
            price: 9500,
          },
          {
            name: "Asbit Djej",
            description: "Sautéed chicken liver, coriander, garlic sauce or sumac",
            price: 14000,
          },
          {
            name: "Soujouk",
            description: "Grilled spicy Lebanese sausages, tomato and pepper sauce",
            price: 19000,
          },
          {
            name: "Makanek Debs Remmane",
            description: "Grilled Lebanese sausages, pomegranate molasses, pine nuts",
            price: 19000,
          },
          {
            name: "Ras Asfour Debs Remmane",
            description: "Sautéed beef cubes, pomegranate molasses, pine nuts",
            price: 24000,
          },
          {
            name: "Kraydis Harr",
            description: "Sautéed shrimp, chilli, garlic",
            price: 24000,
          },
          {
            name: "Foul",
            description: "Fava beans in olive oil, fresh mint, parsley, tomato",
            price: 8500,
          },
          {
            name: "Balila",
            description: "Chickpea in olive oil with cumin",
            price: 10000,
          },
          {
            name: "Batata Harra",
            description: "Spicy potatoes, garlic, coriander",
            price: 9500,
          },
          { name: "Batata Mekliyeh", description: "French fries", price: 9500 },
          { name: "Lentil Soup", description: "Yellow lentil soup", price: 8000 },
        ],
      },
      {
        title: "Sandwiches",
        items: [
          {
            name: "Burger Em Sherif",
            description: "Beef patty, brioche bun, cheddar, coleslaw, french fries",
            price: 27500,
          },
          {
            name: "Djej Msahab",
            description:
              "Grilled marinated baby chicken, garlic cream, pickled cucumber and spicy sauce",
            price: 10000,
          },
          {
            name: "Arayes Kebab",
            description: "Kebab, cheese and pickled cucumber on grilled Arabic bread",
            price: 14000,
          },
          {
            name: "Shawarma Lahmeh",
            description:
              "Beef shawarma, parsley, onion, tomato, pickled cucumber, tahini",
            price: 12000,
          },
          {
            name: "Shawarma Djej",
            description: "Chicken shawarma, garlic cream, pickled cucumber, lettuce",
            price: 10000,
          },
          {
            name: "Batata Mekliyeh",
            description: "French fries and coleslaw",
            price: 7000,
          },
        ],
      },
      {
        title: "Masheweh",
        items: [
          {
            name: "Lahmeh Mechwiyeh",
            description:
              'Grilled beef skewers "Black Angus", tomato, chilli, onion served with oriental rice',
            price: 29000,
          },
          {
            name: "Lahmeh Mechwiyeh",
            description:
              "Grilled lamb skewers, tomato, chilli, onion served with oriental rice",
            price: 36000,
          },
          {
            name: "Riyash",
            description:
              "Marinated lamb cutlet, tomato, chilli, onion served with oriental rice",
            price: 32000,
          },
          {
            name: "Mixed Grill",
            description:
              "Taouk, kebab, kefta and beef skewers, tomato, chilli, onion served with three kinds of rice",
            price: 36000,
          },
          {
            name: "Kebab",
            description:
              "Minced beef skewers, tomato, chilli, onion served with tomato rice with eggplant",
            price: 26000,
          },
          {
            name: "Kefta",
            description:
              "Minced beef skewers, parsley, tomato, chilli, onion served with tomato rice with eggplant",
            price: 26000,
          },
          {
            name: "Taouk",
            description:
              "Grilled marinated chicken skewers, garlic cream served with dill and lemon rice",
            price: 22000,
          },
          {
            name: "Djej Msahab",
            description:
              "Grilled marinated baby chicken, spicy dip, garlic cream served with dill and lemon rice",
            price: 29000,
          },
        ],
      },
      {
        title: "Mains",
        items: [
          {
            name: "Kibbet Lahmeh bi Laban",
            description:
              "Slow-cooked milk-fed lamb, beef and bulgur pie, minced beef and pine nuts, yoghurt",
            price: 31000,
          },
          {
            name: "Fassoulya bi Lahmeh",
            description:
              "Lamb shank with beans in tomato sauce stew, served with white rice",
            // The printed English page says 39,000 and the Arabic says 34,000.
            // The client chose the Arabic figure for all three languages, so
            // this is deliberately not what the English menu prints — see
            // docs/menu-discrepancies.md §1. The Kurdish equivalent is set by
            // CLIENT_PRICES in scripts/menu-from-pdf.mjs.
            price: 34000,
          },
          {
            name: "Beefsteak w Batata",
            description: "Pan fried beef steak, french fries, creamy walnut sauce",
            price: 32000,
          },
        ],
      },
    ],
  },
  drinks: {
    sections: [
      {
        title: "Soft Drinks & Cold Beverages",
        items: [
          { name: "Mineral Water — Large", price: 6500 },
          { name: "Mineral Water — Small", price: 3000 },
          { name: "Aqua Panna — Small", price: 4000 },
          { name: "Sparkling Water — Large", price: 12000 },
          { name: "Sparkling Water — Small", price: 4500 },
          { name: "Seven Up", price: 3500 },
          { name: "Seven Up Diet", price: 3500 },
          { name: "Pepsi", price: 3500 },
          { name: "Pepsi Diet", price: 3500 },
          { name: "Pepsi Zero", price: 3500 },
          { name: "Miranda", price: 3500 },
          { name: "Red Bull", price: 8000 },
          { name: "Red Bull Light", price: 8000 },
          { name: "Non-Alcoholic Beer", price: 9000 },
        ],
      },
      {
        title: "Shisha",
        items: [{ name: "Mouassal", price: 22000 }],
      },
      {
        title: "Mocktails",
        items: [
          { name: "Beast Mode", price: 9500 },
          { name: "Vita C", price: 9500 },
          { name: "Pink 75", price: 9500 },
          { name: "Passion Fruit Mojito", price: 10500 },
          { name: "Tropical Storm", price: 10500 },
          { name: "Rose of Byblos", price: 9500 },
        ],
      },
      {
        title: "Fresh Juices",
        items: [
          { name: "Lemon with Mint", price: 8500 },
          { name: "Lemonade", price: 8500 },
          { name: "Carrot", price: 9000 },
          { name: "Orange", price: 9000 },
          { name: "Ice Tea Peach", price: 8500 },
          { name: "Ice Tea Lemon", price: 8500 },
        ],
      },
      {
        title: "Hot Beverages",
        // Four prices here are re-paired to the Arabic page by the client's
        // decision, so they are deliberately not what the English menu prints
        // — see docs/menu-discrepancies.md §2. All three menus print the same
        // nine prices but list the drinks against them in a different order,
        // and the Arabic order is the one a guest is charged by. The printed
        // English figure is given against each. Flat White is untouched: the
        // Arabic row is a decaf espresso, a different drink rather than a
        // different price. Kurdish is set by CLIENT_PRICES in
        // scripts/menu-from-pdf.mjs.
        items: [
          { name: "Espresso", price: 7000 },
          { name: "Espresso Doppio", price: 7000 }, // printed 9,500
          { name: "Cappuccino", price: 9500 }, // printed 10,000
          { name: "Café Latte", price: 10000 },
          { name: "Café Blanc", price: 10000 }, // printed 6,000 — a 67% rise
          { name: "American Coffee", price: 6000 }, // printed 7,000
          { name: "Flat White", price: 10000 },
          { name: "Kahweh Loubnaniyeh", price: 7000 },
          {
            name: "Tea Selection",
            description: "Chamomile, green tea, earl grey, english breakfast, anis",
            price: 8000,
          },
        ],
      },
    ],
  },
  sweets: {
    sections: [
      {
        title: "Sweets",
        items: [
          {
            name: "Chocolate w Haleweh",
            description: "Gluten-free chocolate cake, haleweh, crisp coconut nibs",
            price: 19000,
          },
          {
            name: "Riz bi Halib",
            description: "Orange blossom and rose rice pudding, crispy rice",
            price: 14000,
          },
          {
            name: "Meghli",
            description: "Spiced vegan pudding, mixed nuts",
            price: 14000,
          },
          {
            name: "Aysh el Saraya",
            description: "Caramelized toasted bread, ashta",
            price: 14000,
          },
          {
            name: "Mafrouket Festok",
            description: "Pistachio and semolina dough, ashta cream",
            price: 19000,
          },
          {
            name: "Muhallabiyeh Karkadeh",
            description: "Muhallabiyeh, karkadeh couli, red berries",
            price: 16000,
          },
          {
            name: "Lazy Cake",
            description: "Creamy chocolate ganache and biscuit bar",
            price: 19000,
          },
          {
            name: "Em Ali",
            description: "Puffed pastry, vanilla infused milk, raisins, mixed nuts",
            price: 18000,
          },
          {
            name: "Merry Cream",
            description: "Chocolate, vanilla or mixed traditional soft serve",
            price: 14000,
          },
          {
            name: "Tamriyeh",
            description: "Phyllo dough stuffed with semolina and milk pudding",
            price: 9000,
          },
          {
            name: "Strawberry Cake",
            description: "Chiffon cake, vanilla cream, strawberry",
            price: 14000,
          },
          {
            name: "Custard",
            description: "Traditional chocolate and vanilla custard",
            price: 14000,
          },
          {
            name: "Bahamas",
            description: "Caramelized banana, crumble caramel, whipped cream",
            price: 15000,
          },
        ],
      },
    ],
  },
};
