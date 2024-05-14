![](./public/apple-touch-icon.png)

Biceps is a local-first personal nutrition planning app.

## Technical details

**Stack**

There's no server, everything runs in the browser.

**Frontend**

- React
- [Mantine](https://mantine.dev/) for UI

**Data stack "backend"**

Everything below runs in the browser but the stack has been insipired by traditional backend architecture. [CRDT](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type) leveraged for local-first data storage and later for potentially syncing.

Starting from back towards front:

- [cr-sqlite](https://github.com/vlcn-io/cr-sqlite) for data storage and local-first support

  - `cr-sqlite` has a built-in automigration system, but it didn't work for all scenarios. For that reason, a custom migration system was implemented in [src/migrations.ts](src/migrations.ts).

- Custom entity database model system that uses SQLite under the hood

  Starting from back towards front:

  - Types are defined as zod schemas. Example: [src/db/schemas/RecipeSchema.ts](src/db/schemas/RecipeSchema.ts)

    Normally, we'd in addition have SQL schema to guarantee constraints, but due to CRDT [not all constraints can be used](https://vlcn.io/docs/cr-sqlite/constraints).

    **These entity schemas are the backbone of everything else**. They allow building all other layers and abstractions with strict types.

  - [src/db/interface/databaseMethods.ts](src/db/interface/databaseMethods.ts) wraps the lower level SQLite API with a few useful primitives similar to [slonik](https://github.com/gajus/slonik/)

  - [src/db/interface/entityInterface.ts](src/db/interface/entityInterface.ts) defines the public API contract that each entity must implement. In addition, every entity can implement any custom method outside the interface for more complicated operations (for example see [Recipe.findManyByProductIds](src/db/entities/Recipe.ts#L45)).

  - [src/db/interface/entityMethods.ts](src/db/interface/entityMethods.ts) implements the API that `entityInterface.ts` specifies. Takes the entity schema and database table name as input.

  - The actual entity implementations are at [src/db/entities](src/db/entities). For example [src/db/entities/Recipe.ts](src/db/entities/Recipe.ts).

  - To ensure each entity implementation actually conforms the interface, there's [src/scripts/autoGenerateEntitiesIndex.ts](src/scripts/autoGenerateEntitiesIndex.ts) to generate the index file that exports all entities.

    The index file looks like this:

    ```ts
    import { createEntity } from 'src/db/interface/entityInterface'

    // This createEntity call ensures the interface compatibility at TypeScript level
    const AppStateEntity = createEntity({
      find: findAppState,
      // ... all methods
    })
    ```

    In addition to type-safety, the index file provides as a convenient import point for all entities.

- Resolver layer

  This is an alternative approach to relationship mapping and JOIN queries usually defined in ORM. There's pros and cons in each approach.

  The layer consists of:

  - [DataLoader](https://github.com/graphql/dataloader/) to avoid N+1 queries in the resolvers.

  - Custom resolvers for each entity model. Defined at [src/db/resolvers/resolversPerEntity.ts](src/db/resolvers/resolversPerEntity.ts).

    The resolver layer is greatly inspired by GraphQL _(which enables even more powerful resolving layer)_. It allows building simple entity models that are mostly separated from each other but also combining them to joint models that are more convenient for the frontend.

- [React Query](https://react-query.tanstack.com/) for data fetching via APIs or SQLite database

- Data access layer abstracted behind [src/hook/useDatabase.ts](src/hooks/useDatabase.ts) hook

### Decision log

Storage layer options considered:

- SQLite WASM
- IndexedDB
- PGLite
- PouchDB
- localStorage
- electric-sql
- https://www.evolu.dev/
- automerge
- vlcn.io

Settled on [cr-sqlite](https://github.com/vlcn-io/cr-sqlite) for the following reasons:

- Data is stored in SQLite which means the app can leverage the full power of SQL
- Supported React out of the box
- CRDT implemented at database level
- Data can be exported easily as IndexedDB export if needed
- Data can be later synced to other devices via relay server

## Acknowledgements

- Nutrition data from https://fineli.fi/fineli/en/elintarvikkeet?
- [food-nutrients](https://github.com/food-nutrients/food-nutrients) project and their nutrition data _(MIT License Copyright (c) 2019 Food Nutrients)_
