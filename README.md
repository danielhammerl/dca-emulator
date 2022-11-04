Definition für eigene CPU architektur

Name: dca
Bassiert auf: ARM
Endianess: Big endian

Beschreibung:
16 Bit CPU, 8 Bit Befehlssatz

Register:

Register ist immer 16 Bit / 2 Byte groß

RPC:
Program counter, enthält memory address der aktuellen anweisung
Adresse: 00000000 00000001

RSP:
Stack pointer, zeigt auf begin des memory stacks
Adresse: 00000000 00100000

R00:
Allgemeines Register 0
Adresse: 00000000 00000010

R01:
Allgemeines Register 1
Adresse: 00000000 00000011

R02:
Allgemeines Register 2
Adresse: 00000000 00000100

R03:
Allgemeines Register 3
Adresse: 00000000 00000101

R04:
Allgemeines Register 4
Adresse: 00000000 00000110

R05:
Allgemeines Register 5
Adresse: 00000000 00000111

R06:
Allgemeines Register 6
Adresse: 00000000 00001000

R07:
Allgemeines Register 7
Adresse: 00000000 00001001

R08:
Allgemeines Register 8
Adresse: 00000000 00001010

R09:
Allgemeines Register 9
Adresse: 00000000 00001011


Zeichensatz:

Eine Instruktion besteht immer aus 5 Byte
opcode (byte), operand1 (half-word) operand2 (half-word)

LOAD:
Lädt Byte aus Speicher in Register ( an least significant )
opcode: 00000001
Beispiel: LOAD R0 R1 -> Lädt Daten aus Speicher aus Adresse gespeichert in R0 in Register R1
Beispiel: LOAD R0 R1 -> R0 enthält adresse 10101111 00110101, wert an adresse ist 01111111, dann enthält Register R1
danach den Wert 00000000 01111111

STORE:
Speichert Byte (least significant) aus Register in Speicher
opcode: 00000010
Beispiel: STORE R0 R1 -> Speichert least significant byte aus R0 in memory addresse gespeichert in R1

SET:
Setzt wert von register, nicht anwendbar auf read-only register
opcode: 00000011
Beispiel: SET R0 00000000 00000111 -> Setzt R0 auf den wert 7 (00000000 00000111)

LOADH:
Lädt Half Word aus Speicher in Register
opcode: 00000100

STOREH: Speichert Half Word aus Register in Speicher
opcode: 00000101

ADD:
Addiert Wert
opcode: 00000110
Beispiel: ADD R0 R1 -> Addiert die Werte in R0 und R1 (r0 - r1) und speichert das ergebnis in R0

SUB:
Subtrahiert Wert
opcode: 00000111
Beispiel: SUB R0 R1 -> Subtrahiert R1 von R0 und speichert das Ergebnis in R0

CJUMP
Conditional Jump
opcode: 00001000
Beispiel: CJUMP R0 R1 -> Springt an adresse in R0 wenn der wert in R1 gleich 0 ist

MOV
move
opcode: 00001001
Beispiel: MOV R0 R1 -> kopiert wert von R0 in R1