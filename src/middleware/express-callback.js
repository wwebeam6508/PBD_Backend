

export default (controller) => async (req, res,next) => {
    const httpRequest = {
      body: req.body,
      query: req.query,
      params: req.params,
      ip: req.ip,
      method: req.method,
      path: req.path,
      cookie: req.cookie,
      headers: {
        'Content-Type': req.get('Content-Type'),
        Authorization: req.get('Authorization'),
        Referer: req.get('referer'),
        'User-Agent': req.get('User-Agent')
      }
    };
    try {
      const httpResponse = await controller(httpRequest);
      if (httpResponse.headers) res.set(httpResponse.headers);
      if (httpResponse.cookie) {
          for (const key in httpResponse.cookie) {
              if (Object.hasOwnProperty.call(httpResponse.cookie, key)) {
                  res.cookie(key, httpResponse.cookie[key], { httpOnly: true, 
                      sameSite: 'None', secure: true, 
                      maxAge: 24 * 60 * 60 * 1000 });
              }
          }
      }
      return res.status(httpResponse.statusCode).send(httpResponse.body);
    } catch (error) {
      next(error)
    }
};


