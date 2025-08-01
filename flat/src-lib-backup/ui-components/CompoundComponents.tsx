/**
 * Compound Components Export
 * 
 * This file exports all compound components following the SOLID-FLAT principles:
 * - Single Source of Truth (SSOT)
 * - Open for Extension, Closed for Modification (OCP)
 * - Liskov Substitution Principle (LSP)
 * - Interface Segregation (ISP)
 * - Dependency Inversion (DIP)
 * 
 * Benefits of Compound Components:
 * 1. Flexible API - compose components as needed
 * 2. Implicit state sharing - no prop drilling
 * 3. Semantic markup - clear component relationships
 * 4. Better TypeScript support - proper type inference
 */

// Re-export compound components
export { Modal } from './Modal';
export { Table } from './Table';
export { Form } from './Form';

// Already using compound pattern
export { 
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from './Card';

// Example usage documentation
export const CompoundComponentExamples = {
  Modal: `
    <Modal.Root isOpen={isOpen} onClose={onClose} size={ModalSize.LG}>
      <Modal.Header>
        <Modal.Title>Edit Project</Modal.Title>
        <Modal.Description>Update project details below</Modal.Description>
      </Modal.Header>
      <Modal.Body>
        {/* Content */}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={onSave}>Save</Button>
      </Modal.Footer>
    </Modal.Root>
  `,
  
  Table: `
    <Table.Root data={projects} selectable defaultSort={{ key: 'date', direction: 'desc' }}>
      <Table.Header>
        <Table.Row>
          <Table.Select />
          <Table.Head sortKey="name">Name</Table.Head>
          <Table.Head sortKey="status">Status</Table.Head>
          <Table.Head sortKey="date" align="right">Date</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {(data) => data.length > 0 ? (
          data.map(item => (
            <Table.Row key={item.id}>
              <Table.Select id={item.id} />
              <Table.Cell>{item.name}</Table.Cell>
              <Table.Cell>{item.status}</Table.Cell>
              <Table.Cell align="right">{item.date}</Table.Cell>
            </Table.Row>
          ))
        ) : (
          <Table.Empty>No projects found</Table.Empty>
        )}
      </Table.Body>
    </Table.Root>
  `,
  
  Form: `
    <Form.Root onSubmit={handleSubmit} errors={errors} touched={touched}>
      <Form.Section title="Project Details">
        <Form.Field name="name">
          <Form.Label required>Project Name</Form.Label>
          <Form.Input type="text" placeholder="Enter name" />
          <Form.Error />
        </Form.Field>
        
        <Form.Field name="description">
          <Form.Label>Description</Form.Label>
          <Form.Textarea rows={4} />
          <Form.Helper>Optional project description</Form.Helper>
          <Form.Error />
        </Form.Field>
      </Form.Section>
      
      <Form.Actions>
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary" type="submit">Save</Button>
      </Form.Actions>
    </Form.Root>
  `,
  
  Card: `
    <Card variant={CardVariant.ELEVATED}>
      <CardHeader>
        <CardTitle>Project Overview</CardTitle>
        <CardDescription>View and manage your projects</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Content */}
      </CardContent>
      <CardFooter>
        <Button size="sm">View All</Button>
      </CardFooter>
    </Card>
  `
};

// Default export for consistency with index.ts
export default CompoundComponentExamples;