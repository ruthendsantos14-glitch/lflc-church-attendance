const CACHE_NAME = "lflc-attendance-v10";

self.addEventListener(
  "install",
  event => {

    self.skipWaiting();

    event.waitUntil(
      caches.open(CACHE_NAME)
    );

  }
);


self.addEventListener(
  "activate",
  event => {

    event.waitUntil(

      caches.keys()
        .then(
          keys => {

            return Promise.all(

              keys
                .filter(
                  key =>
                    key !==
                    CACHE_NAME
                )
                .map(
                  key =>
                    caches.delete(
                      key
                    )
                )
            );

          }
        )
        .then(
          () =>
            self.clients.claim()
        )

    );

  }
);


self.addEventListener(
  "fetch",
  event => {

    if (
      event.request.method !==
      "GET"
    ) {

      return;

    }


    const url =
      new URL(
        event.request.url
      );


    /*
     * Only cache our own
     * GitHub Pages files.
     */
    if (
      url.origin !==
      self.location.origin
    ) {

      return;

    }


    /*
     * ALWAYS request a fresh
     * index.html.
     */
    if (
      event.request.mode ===
      "navigate"
    ) {

      event.respondWith(

        fetch(
          event.request,
          {
            cache:
              "no-store"
          }
        )
          .then(
            response => {

              const copy =
                response.clone();


              caches.open(
                CACHE_NAME
              )
                .then(
                  cache =>
                    cache.put(
                      event.request,
                      copy
                    )
                );


              return response;

            }
          )
          .catch(
            () =>
              caches.match(
                "./index.html"
              )
          )

      );


      return;

    }


    /*
     * Other local files.
     */
    event.respondWith(

      caches.match(
        event.request
      )
        .then(
          cached => {

            if (cached) {

              return cached;

            }


            return fetch(
              event.request
            )
              .then(
                response => {

                  if (
                    response &&
                    response.ok
                  ) {

                    const copy =
                      response.clone();


                    caches.open(
                      CACHE_NAME
                    )
                      .then(
                        cache =>
                          cache.put(
                            event.request,
                            copy
                          )
                      );

                  }


                  return response;

                }
              );

          }
        )

    );

  }
);
