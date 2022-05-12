import { NgModule } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { ApolloLink } from '@apollo/client/core';
import { InMemoryCache } from '@apollo/client/cache';
import { setContext } from '@apollo/client/link/context';
import { HttpLink } from 'apollo-angular/http';
import { AUTH_TYPE } from 'aws-appsync';
import { createAuthLink } from 'aws-appsync-auth-link';
import { createSubscriptionHandshakeLink } from 'aws-appsync-subscription-link';

import { CasTicketService } from './services';

export function createApollo(httpLink: HttpLink, cas: CasTicketService) {
  const url = 'https://attendix.apu.edu.my/graphql';
  const region = 'ap-southeast-1';

  const rfl = ApolloLink.from([
    setContext(async (_request, previousContext: Record<string, any>) => {
      return ({
        headers: {
          ...previousContext.headers,
          ticket: await firstValueFrom(cas.getST('https://api.apiit.edu.my/attendix'))
        }
      });
    }),
    httpLink.create({ uri: url })
  ]);

  const link = ApolloLink.from([
    createAuthLink({
      url, region, auth: {
        type: AUTH_TYPE.API_KEY,
        apiKey: 'da2-dv5bqitepbd2pmbmwt7keykfg4'
      }
    }),
    createSubscriptionHandshakeLink(url, rfl)
  ]);
  return { cache: new InMemoryCache(), link };
}

@NgModule({
  exports: [ApolloModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink, CasTicketService],
    },
  ],
})
export class GraphQLModule { }
