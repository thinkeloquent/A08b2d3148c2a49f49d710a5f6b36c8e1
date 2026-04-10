```sh
# example version directory shown on Maven Central
curl -L -o opendistro-sql-jdbc.jar \
  https://repo1.maven.org/maven2/com/amazon/opendistroforelasticsearch/client/opendistro-sql-jdbc/1.8.0.0/opendistro-sql-jdbc-1.8.0.0.jar

curl -L \
  --proxy http://proxy.company.com:8080 \
  -o opendistro-sql-jdbc.jar \
  https://repo1.maven.org/maven2/com/amazon/opendistroforelasticsearch/client/opendistro-sql-jdbc/1.8.0.0/opendistro-sql-jdbc-1.8.0.0.jar

curl -L \
  --proxy https://proxy.company.com:8443 \
  -o opendistro-sql-jdbc.jar \
  https://repo1.maven.org/maven2/com/amazon/opendistroforelasticsearch/client/opendistro-sql-jdbc/1.8.0.0/opendistro-sql-jdbc-1.8.0.0.jar

curl -L \
  --proxy http://proxy.company.com:8080 \
  --cacert /path/to/corp-root-ca.pem \
  -o opendistro-sql-jdbc.jar \
  https://repo1.maven.org/maven2/com/amazon/opendistroforelasticsearch/client/opendistro-sql-jdbc/1.8.0.0/opendistro-sql-jdbc-1.8.0.0.jar

curl -L \
  --proxy http://proxy.company.com:8080 \
  --capath /etc/ssl/certs \
  -o opendistro-sql-jdbc.jar \
  https://repo1.maven.org/maven2/com/amazon/opendistroforelasticsearch/client/opendistro-sql-jdbc/1.8.0.0/opendistro-sql-jdbc-1.8.0.0.jar
```

```sh
curl -L -o postgresql-jdbc.jar \
  https://repo1.maven.org/maven2/org/postgresql/postgresql/42.7.4/postgresql-42.7.4.jar
```

```sh
curl -L \
  --proxy http://proxy.company.com:8080 \
  -o x-pack-sql-jdbc.jar \
  https://repo1.maven.org/maven2/org/elasticsearch/plugin/x-pack-sql-jdbc/9.2.4/x-pack-sql-jdbc-9.2.4.jar
```
