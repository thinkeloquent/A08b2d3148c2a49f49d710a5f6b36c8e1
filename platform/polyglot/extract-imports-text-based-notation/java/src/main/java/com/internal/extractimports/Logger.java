package com.internal.extractimports;

import java.util.logging.ConsoleHandler;
import java.util.logging.Formatter;
import java.util.logging.Level;
import java.util.logging.LogRecord;

/**
 * Package-local logger with prefixed formatting.
 */
public final class Logger {

    private final java.util.logging.Logger delegate;

    private Logger(java.util.logging.Logger delegate) {
        this.delegate = delegate;
    }

    /**
     * Create a logger with package name and filename prefix.
     */
    public static Logger create(String packageName, String filename) {
        String name = packageName + ":" + filename;
        java.util.logging.Logger jLogger = java.util.logging.Logger.getLogger(name);

        if (jLogger.getHandlers().length == 0) {
            ConsoleHandler handler = new ConsoleHandler();
            String prefix = "[" + packageName + ":" + filename + "]";
            handler.setFormatter(new Formatter() {
                @Override
                public String format(LogRecord record) {
                    return prefix + " " + record.getMessage() + System.lineSeparator();
                }
            });
            jLogger.addHandler(handler);
            jLogger.setUseParentHandlers(false);
        }

        jLogger.setLevel(Level.WARNING);
        return new Logger(jLogger);
    }

    public void debug(String msg) {
        delegate.fine(msg);
    }

    public void info(String msg) {
        delegate.info(msg);
    }

    public void warn(String msg) {
        delegate.warning(msg);
    }

    public void error(String msg) {
        delegate.severe(msg);
    }
}
