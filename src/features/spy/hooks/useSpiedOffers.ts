// Barrel re-exports — mantém compatibilidade com todos os 14 consumidores existentes
// Hooks foram decompostos em BD-2.1 para melhor manutenção e testabilidade

export {
  useSpiedOffers,
  useSpiedOffer,
  useCreateSpiedOffer,
  useUpdateSpiedOffer,
  useDeleteSpiedOffer,
} from './useSpiedOffersCRUD';

export {
  useOfferTrafficData,
  useBulkInsertTrafficData,
  useLatestTrafficPerOffer,
  useUpdateTrafficData,
  useDeleteTrafficData,
  useOfferTrafficSummary,
  type OfferTrafficSummary,
} from './useSpiedOffersTraffic';

export {
  useOfferDomains,
  useCreateOfferDomain,
  useDeleteOfferDomain,
  useUpdateOfferDomain,
} from './useOfferDomains';

export {
  useOfferAdLibraries,
  useCreateOfferAdLibrary,
  useDeleteOfferAdLibrary,
  useUpdateOfferAdLibrary,
  useOfferFunnelSteps,
  useCreateFunnelStep,
  useUpdateFunnelStep,
  useDeleteFunnelStep,
} from './useOfferRelations';
