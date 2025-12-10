package org.workshop.momentummosaicapp.utility.exception;

public class ForbiddenException extends RuntimeException {
    public ForbiddenException() { super(); }
    public ForbiddenException(String message) { super(message); }
}
