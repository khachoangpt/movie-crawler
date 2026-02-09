import { asClass, AwilixContainer, Lifetime } from 'awilix'
import path from 'path'

type ServiceLoaderParams = {
  container: AwilixContainer
}

export default async ({ container }: ServiceLoaderParams) => {
  container.loadModules(
    [
      [
        path.join(__dirname, '..', 'services/**/*.{ts,js}'),
        {
          register: asClass,
          lifetime: Lifetime.SINGLETON,
        },
      ],
    ],
    {
      formatName: 'camelCase',
      resolverOptions: {
        lifetime: Lifetime.SINGLETON,
        register: asClass,
      },
    },
  )
}