import { createServer } from "node:http";
import { type AddressInfo } from "node:net";
import { listen } from "soap";
import { BanguatService } from "./banguat-service";

it("reads an exchange rate through the real SOAP client and XML parser", async () => {
  const server = createServer();
  const wsdl = `<?xml version="1.0"?>
    <definitions xmlns="http://schemas.xmlsoap.org/wsdl/"
      xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
      xmlns:xs="http://www.w3.org/2001/XMLSchema"
      xmlns:tns="urn:banguat-test" targetNamespace="urn:banguat-test">
      <types>
        <xs:schema targetNamespace="urn:banguat-test" elementFormDefault="qualified">
          <xs:complexType name="Rate"><xs:sequence>
            <xs:element name="fecha" type="xs:string"/>
            <xs:element name="referencia" type="xs:string"/>
          </xs:sequence></xs:complexType>
          <xs:complexType name="Rates"><xs:sequence>
            <xs:element name="VarDolar" type="tns:Rate" maxOccurs="unbounded"/>
          </xs:sequence></xs:complexType>
          <xs:complexType name="Result"><xs:sequence>
            <xs:element name="CambioDolar" type="tns:Rates"/>
          </xs:sequence></xs:complexType>
          <xs:element name="TipoCambioDia" type="xs:anyType"/>
          <xs:element name="TipoCambioDiaResponse"><xs:complexType><xs:sequence>
            <xs:element name="TipoCambioDiaResult" type="tns:Result"/>
          </xs:sequence></xs:complexType></xs:element>
        </xs:schema>
      </types>
      <message name="Request"><part name="parameters" element="tns:TipoCambioDia"/></message>
      <message name="Response"><part name="parameters" element="tns:TipoCambioDiaResponse"/></message>
      <portType name="ExchangePort"><operation name="TipoCambioDia">
        <input message="tns:Request"/><output message="tns:Response"/>
      </operation></portType>
      <binding name="ExchangeBinding" type="tns:ExchangePort">
        <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
        <operation name="TipoCambioDia"><soap:operation soapAction="urn:TipoCambioDia"/>
          <input><soap:body use="literal"/></input>
          <output><soap:body use="literal"/></output>
        </operation>
      </binding>
      <service name="ExchangeService"><port name="ExchangePort" binding="tns:ExchangeBinding">
        <soap:address location="http://127.0.0.1/exchange"/>
      </port></service>
    </definitions>`;

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const endpoint = `http://127.0.0.1:${(server.address() as AddressInfo).port}/exchange`;

  try {
    listen(server, "/exchange", {
      ExchangeService: {
        ExchangePort: {
          TipoCambioDia: () => ({
            TipoCambioDiaResult: {
              CambioDolar: {
                VarDolar: [{ fecha: "20/03/2024", referencia: "7.85123" }],
              },
            },
          }),
        },
      },
    }, wsdl.replace("http://127.0.0.1/exchange", endpoint));

    const service = new BanguatService({ endpoint: `${endpoint}?wsdl` });
    await expect(service.getCurrentRate()).resolves.toEqual({
      date: new Date(2024, 2, 20),
      buyRate: 7.85123,
      sellRate: 7.85123,
    });
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
      server.closeAllConnections();
    });
  }
});
