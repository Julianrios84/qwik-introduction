import {
  $,
  component$,
  useComputed$,
  useSignal,
  useStore,
  useVisibleTask$,
} from '@builder.io/qwik';
import {
  type DocumentHead,
  Link,
  routeLoader$,
  useLocation,
} from '@builder.io/qwik-city';
import { PokemonImage } from '~/components/pokemons/pokemon-image';
import { getSmallPokemons } from '~/helpers/get-small-pokemons';
import type { SmallPokemon } from '~/interfaces';
import { Modal } from '~/components/shared';
import { getChatGptResponse } from '~/helpers/get-chat-gpt-response';

export const usePokemonList = routeLoader$<SmallPokemon[]>(
  async ({ query, redirect, pathname }) => {
    const offset = Number(query.get('offset') || '0');
    if (offset < 0 || isNaN(offset)) {
      redirect(301, pathname);
    }

    return await getSmallPokemons(offset);
  }
);

export default component$(() => {
  const pokemons = usePokemonList();
  const location = useLocation();

  const modalVisible = useSignal(false);
  const modalPokemon = useStore({
    id: '',
    name: '',
  });

  const chatGptPokemonResponse = useSignal('');

  const showModal = $((id: string, name: string) => {
    modalPokemon.id = id;
    modalPokemon.name = name;
    modalVisible.value = true;
  });

  const closeModal = $(() => {
    modalVisible.value = false;
  });

  const currentOffset = useComputed$<number>(() => {
    const offsetString = new URLSearchParams(location.url.search);
    return Number(offsetString.get('offset') || 0);
  });

  useVisibleTask$(({ track }) => {
    track(() => modalPokemon.name);
    chatGptPokemonResponse.value = '';
    if (modalPokemon.name.length > 0) {
      getChatGptResponse(modalPokemon.name).then(
        (response) => (chatGptPokemonResponse.value = response)
      );
    }
  });

  return (
    <>
      <div class="flex flex-col">
        <span class="my-5 text-5xl">Status</span>
        <span>Offset: {currentOffset}</span>
        <span>Está cargando página: {location.isNavigating ? 'Si' : 'No'}</span>
      </div>

      <div class="mt-10">
        <Link
          href={`/pokemons/list-ssr/?offset=${currentOffset.value - 10}`}
          class="btn btn-primary mr-2"
        >
          Anterior
        </Link>

        <Link
          href={`/pokemons/list-ssr/?offset=${currentOffset.value + 10}`}
          class="btn btn-primary mr-2"
        >
          Siguiente
        </Link>
      </div>

      <div class="grid grid-cols-6 mt-5">
        {pokemons.value.map(({ id, name }) => (
          <div
            key={name}
            onClick$={() => showModal(id, name)}
            class="m-5 flex flex-col justify-center items-center"
          >
            <PokemonImage id={id} />
            <span class="capitalize">{name}</span>
          </div>
        ))}
      </div>

      <Modal
        showModal={modalVisible.value}
        hiddenModal={closeModal}
        size="md"
        persistent
      >
        <div q:slot="title">{modalPokemon.name}</div>
        <div q:slot="content" class="flex flex-col justify-center items-center">
          <PokemonImage id={modalPokemon.id} />
          <span>
            {chatGptPokemonResponse.value === ''
              ? 'Peguntandole a chat GPT'
              : chatGptPokemonResponse}
          </span>
        </div>
      </Modal>
    </>
  );
});

export const head: DocumentHead = {
  title: 'PokeQwik - SSR',
  meta: [
    {
      name: 'description',
      content: 'Qwik SSR Pokemon',
    },
  ],
};
