import {
  Slot,
  component$,
  useContextProvider,
  useStore,
  useVisibleTask$,
} from '@builder.io/qwik';
import {
  PokemonGameContext,
  type PokemonGameState,
  PokemonListContext,
  type PokemonListState,
} from '../';

export const PokemonProvider = component$(() => {
  const pokemonGame = useStore<PokemonGameState>({
    pokemonId: 4,
    isPokemonVisible: true,
    showBackImage: false,
  });

  const pokemonList = useStore<PokemonListState>({
    currentPage: 1,
    isLoading: false,
    pokemons: [],
  });

  useContextProvider(PokemonGameContext, pokemonGame);
  useContextProvider(PokemonListContext, pokemonList);

  useVisibleTask$(() => {
    if (localStorage.getItem('pokemon-game')) {
      const {
        pokemonId = 10,
        showBackImage = false,
        isPokemonVisible = true,
      } = JSON.parse(localStorage.getItem('pokemon-game')!) as PokemonGameState;

      pokemonGame.pokemonId = pokemonId;
      pokemonGame.showBackImage = showBackImage;
      pokemonGame.isPokemonVisible = isPokemonVisible;
    }
  });

  useVisibleTask$(({ track }) => {
    track(() => [
      pokemonGame.pokemonId,
      pokemonGame.showBackImage,
      pokemonGame.isPokemonVisible,
    ]);
    localStorage.setItem('pokemon-game', JSON.stringify(pokemonGame));
  });

  return <Slot />;
});
