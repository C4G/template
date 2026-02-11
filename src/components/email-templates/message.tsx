import * as React from 'react';
import { Html, Body, Container, Heading, Text } from '@react-email/components';

interface MessageTemplateProps {
  name: string;
  body: string;
}

export const MessageTemplate: React.FC<Readonly<MessageTemplateProps>> = ({
  name,
  body,
}) => (
  <Html>
    <Body>
      <Container>
        <Heading>Hello, {name}!</Heading>
        <Text>{body}</Text>
      </Container>
    </Body>
  </Html>
);
