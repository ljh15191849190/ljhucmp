import CatalogApplyToInstance from '@/components/catalog/instance/CatalogApplyToInstance'
import ServiceCatalog from '@/components/catalog/ServiceCatalog'

export default [
    {
        authority: {
            license: ['forbid']
        },
        path: '/service-catalog',
        name: 'servicecatalog',
        component: ServiceCatalog
    },
    {
        authority: {
            license: ['forbid']
        },
        path: '/catalog/:code',
        name: 'applytoInstance',
        component: CatalogApplyToInstance
    }
]
