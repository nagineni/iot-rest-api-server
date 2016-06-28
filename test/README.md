
## Environment Variables

* `API_SERVER_HOST` - Hostname/address where API server is running
  (default: localhost)
* `API_SERVER_PORT` - Port where API server is running (default: 8000)
* `API_SERVER_HTTPS` - To use https instead of http (default: http)
* `REQUEST_PATH` - request path (default: /)
* `SWUPD_REPO_URL` - URL where the software bundles are located.
* `BUNDLE_NAME` - Software bundle name.

## Examples

### oic-get

```sh
# Resource discovery (/oic/res)
./oic-get "/res"

# Device discovery discovery (/oic/d)
./oic-get "/d"

# Platform discovery (/oic/p)
./oic-get "/p"

# Resource get (/a/light?di=<Device ID>)
./oic-get "/a/light?di=<di>"

# Resource get with query filter (/a/light?di=<Device ID> with power less than 50)
./oic-get "/a/light?di=?di=<di>&power<50"

# Resource observe (/a/light?di=<Device ID>&obs=1)
./oic-get "/a/light?di=<di>&obs=1"
```

### oic-put

```sh
# Resource put (/a/light?di=<Device ID> from a file: put-light-values.txt)
./oic-put "/a/light?di=<di>"
```

### Software Update

```sh
# Verify content for OS version  (GET /verfiy)
REQUEST_PATH=/verify SWUPD_REPO_URL=<URL of the repo> ./sw-update

# List all available bundles for the current version (GET)
./sw-update

# Install a new bundle (PUT)
BUNDLE_NAME=<Bundle Name> SWUPD_REPO_URL=<URL of the repo> ./sw-update PUT

# Uninstall a bundle (DELETE)
BUNDLE_NAME=<Bundle Name> ./sw-update DELETE

# Update to latest OS version (POST)
SWUPD_REPO_URL=<URL of the repo> ./sw-update POST
