import { useState, useEffect } from "react";

function RenderLogic() {
  const [pokemonCards, setPokemonCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clickedImages, setClickedImages] = useState([]);
  const [bestScore, setBestScore] = useState(0);

  const shuffle = ([...cards]) => {
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
  };

  useEffect(() => {
    async function fetchPokemonData() {
      //1. Fetch the batch of Pokemon
      try {
        const response = await fetch(
          "https://pokeapi.co/api/v2/pokemon?limit=20",
        );
        const data = await response.json();

        const detailedPokemon = await Promise.all(
          data.results.map(async (pokemon) => {
            const res = await fetch(pokemon.url);
            const details = await res.json();
            return {
              id: details.id,
              name: details.name,
              image:
                details.sprites.other["official-artwork"].front_default ||
                details.sprites.front_default,
            };
          }),
        );
        setPokemonCards(detailedPokemon);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching Pokemon:", error);
        setLoading(false);
      }
    }
    fetchPokemonData();
  }, []);

  if (loading) return <p>Loading Cards...</p>;

  function updateBestScore(currentScore) {
    if (currentScore > bestScore) {
      setBestScore(currentScore);
    }
  }

  function processTurn(imageId) {
    const newClickedImages = [...clickedImages, imageId];
    setClickedImages(newClickedImages);

    //restart if same image is clicked twice
    if (clickedImages.includes(imageId)) {
      updateBestScore(clickedImages.length);
      setClickedImages([]);
      setPokemonCards(shuffle(pokemonCards));
    } else {
      //check for perfect score
      if (newClickedImages.length === pokemonCards.length) {
        updateBestScore(clickedImages.length);
        setClickedImages([]);
      } else {
        setPokemonCards(shuffle(pokemonCards));
      }
    }
  }

  return (
    <>
      <div className="header-section">
        <div className="header-container">
          <h1>Blazing Jas Memory Game</h1>
          <p>Game Instructions:</p>
          <p>
            Get Points by clicking an image, the game resets when you click on
            the same image twice
          </p>
        </div>
        <div className="score-container">
          <p>Score:{clickedImages.length}</p>
          <p>Best Score:{bestScore}</p>
        </div>
      </div>
      <div className="card-grid">
        {pokemonCards.map((poke) => (
          <div
            key={poke.id}
            className="memory-card"
            onClick={() => processTurn(poke.id)}
          >
            <img src={poke.image} alt={poke.name} />
            <p>{poke.name}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export default RenderLogic;
