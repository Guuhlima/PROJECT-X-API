# Tracking Platform

Plataforma distribuída para rastreamento de entregas, construída com foco em arquitetura orientada a eventos, baixo acoplamento, escalabilidade e manutenibilidade.

O sistema é projetado seguindo princípios de Domain-Driven Design (DDD), Clean Architecture e SOLID, com separação clara de responsabilidades entre serviços, domínio e infraestrutura.

---

## Visão Geral da Arquitetura

A plataforma é composta por microserviços independentes, que se comunicam principalmente por meio de mensageria assíncrona (RabbitMQ).

A automação de notificações e integrações externas é realizada via N8N, desacoplada do core do domínio.

---

## Serviços

### tracking-api

Responsável pela camada de API e pelo domínio principal de rastreamento.

Responsabilidades:
- Cadastro e consulta de rastreios
- Exposição de endpoints REST
- Publicação de eventos de domínio
- Validação de regras de negócio

---

### tracking-worker

Serviço assíncrono responsável pelo processamento de rastreios.

Responsabilidades:
- Consumo de eventos via RabbitMQ
- Coleta de atualizações de rastreamento
- Persistência de eventos
- Atualização do status atual
- Publicação de eventos de atualização

---

### notification-service

Serviço responsável pelo domínio de notificações e subscriptions.

Responsabilidades:
- Gerenciamento de inscrições (subscriptions)
- Reação a eventos de atualização de rastreio
- Deduplicação de notificações
- Disparo de automações no N8N

Este serviço não acessa diretamente o banco do Tracking Service.

---

### n8n

Camada de automação e integração externa.

Responsabilidades:
- Envio de e-mails
- Integrações com serviços externos
- Orquestração de fluxos automatizados
- Integrações futuras com agentes de IA

---

### frontend

Interface do usuário responsável por:
- Cadastro de rastreios
- Visualização de status atual
- Exibição da linha do tempo de eventos

---

## Arquitetura de Software

### Princípios adotados

- Domain-Driven Design (DDD)
- Clean Architecture
- SOLID
- Event-Driven Architecture
- Database per Service
- Baixo acoplamento e alta coesão

Cada serviço segue a mesma estrutura base:

src/
 ├── domain/
 ├── application/
 ├── infrastructure/
 ├── shared/
 └── main.ts

---

## Domínio Principal

### Tracking Service (Core Domain)

Entidades sob responsabilidade exclusiva:
- Tracking
- TrackingEvent

Responsabilidades:
- Manter o estado do rastreio
- Persistir histórico de eventos
- Garantir idempotência
- Publicar eventos de domínio

---

## Mensageria (RabbitMQ)

Exchanges:
- tracking (topic)

Filas:
- tracking.refresh.requested
- tracking.updated
- notification.send.requested
