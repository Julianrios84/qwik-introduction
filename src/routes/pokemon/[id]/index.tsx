import { component$ } from '@builder.io/qwik';
import { type RequestEventLoader, routeLoader$ } from '@builder.io/qwik-city';
import { PokemonImage } from '~/components/pokemons/pokemon-image';

export const usePokemonId = routeLoader$(
  ({ params, redirect }: RequestEventLoader) => {
    const id = Number(params.id);
    if (isNaN(id)) {
      redirect(301, '/');
    }

    return id;
  }
);

export default component$(() => {
  // // const location = useLocation();
  const pokemonId = usePokemonId();
  return (
    <>
      {/* <span class="text-5l">Pokemon: {location.params.id}</span> */}
      <span class="text-5l">Pokemon: {pokemonId}</span>
      <PokemonImage id={pokemonId.value} />
    </>
  );
});
