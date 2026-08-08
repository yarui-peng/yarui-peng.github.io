Deployment notes will live here.

The intended first deployment is Nginx serving the Astro `static/dist/` directory and reverse-proxying `/api/` to the local Node service. Private media must not be served from the public static directory.
